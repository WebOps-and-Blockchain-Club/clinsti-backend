import express from 'express';
import client from '../../postgres';
import validate from '../middleware/validator'
import fileManager from '../Utils/file'
import auth from '../middleware/auth';
import path from 'path';
import upload from  '../middleware/upload'

const router = express.Router();

const strFun = (query: any) => {
    const setValues : string[] = []
    if(!query){
        return;
    }
    query?.forEach((_query: string) => {
        setValues.push("'" +_query + "'")
    });
    return "(" + setValues.join(',') + ")"
}

router.post('/client/complaints',auth ,upload, validate,async (req, res) => {
    const {description, location, wasteType, zone} = req.body

    var filenames = fileManager.extractFilenames(req)
    

    let createdTime = new Date().toISOString()
    
    // image filename array value to be inserted to table
    let imagefilenames = filenames.length>0 
        ? `'{"${Array.from(filenames,
                    (filename)=>filename.split('_').slice(1).join("")
                    ).join('","')}"}'`
        : 'null'
    
    try {
        await client.query(`insert into complaints (user_id,description,_location,waste_type,zone,status,created_time,images) values ('${req.headers.userID}','${description}','${location}','${wasteType}','${zone}','posted','${createdTime}',${imagefilenames})`)
    } catch (e)
    {
        fileManager.deleteFiles(filenames)
        return res.status(500).send(e.detail)
    }
    
    
    return res.status(201).send()
})

router.get('/client/complaints/:complaintid', auth, async (req, res) => {

    try {
        const result = await client.query(
            'select * from complaints where complaint_id = $1',
            [req.params.complaintid],
        );
        
        if(result.rowCount === 0) {
            return res.status(404).send('Complaint Not Found');
        }

        if(result.rows[0].user_id !== req.headers.userID) {
            return res.status(401).send('Access denied');
        }

        const {complaint_id, description, _location, waste_type, zone, status, created_time, completed_time, images, feedback_rating, feedback_remark, admin_remark} = result.rows[0];
        return res.status(200).send({complaint_id, description, _location, waste_type, zone, status, created_time, completed_time, images, feedback_rating, feedback_remark, admin_remark})

    } catch (e) {
        return res.status(500).send('Server Error')
    }

})

router.get('/client/complaints', auth, async (req, res) => {

    const zone = req.query.zone?.toString().split(',')
    const status = req.query.status?.toString().split(',')
    let dateFrom = req.query.dateFrom
    let dateTo = req.query.dateTo
    
    const reqLimit = req.query.limit?.toString()
    const reqSkip = req.query.skip?.toString()
    let limit = 10
    let skip = 0

    const zoneStr = strFun(zone)
    const statusStr = strFun(status)

    if(reqLimit) limit = parseInt(reqLimit)
    if(reqSkip) skip = parseInt(reqSkip)
    
    try{
        const setValues: string[] = []
        if(zoneStr) setValues.push('zone IN ' + zoneStr)
        if(statusStr) setValues.push('status IN ' + statusStr)
        if(dateFrom) setValues.push(`created_time >= '${dateFrom}'`)
        if(dateTo) setValues.push(`created_time <= '${dateTo}'`)
        const queryStr1 = setValues.join(' and ')

        let queryStr = 'select complaint_id, _location, created_time, status from complaints '
        if(queryStr1) queryStr += 'where '+ queryStr1
        queryStr += ' order by created_time DESC OFFSET ' + skip + ' LIMIT ' + limit
       
        const result = await client.query(queryStr)

        if(result.rowCount === 0){
            return res.status(404).send('No Complaint Registered yet!')
        }
        return res.status(200).send(result.rows);
    }
    catch (e) {
        return res.status(500).send('Server Error');
    }
})

router.get('/client/images/:imagename', auth, async (req, res) => {
    
    try {
        const imagePath = path.join(fileManager.imageDirectory, req.headers.userID+'_'+req.params.imagename);

        if(!fileManager.isFileExists(imagePath)) {
            return res.status(404).send('File doesnot Exists')
        }

        return res.status(200).sendFile(imagePath);
    } catch {
        return res.status(500).send('Server Error')
    }
})

router.post('/client/complaints/:complaintid/feedback', auth, validate, async (req, res)=>{

    const complaintId = req.params.complaintid
    const {fbRating, fbRemark} = req.body

    try {
        const queryResult = await client.query(`select user_id,feedback_rating from complaints where complaint_id=${complaintId}`)
        if (!queryResult.rows[0]){
            return res.status(404).send()
        }

        const complaintUserId = queryResult.rows[0].user_id
        
        if (complaintUserId === req.headers.userID){
            if (queryResult.rows[0].feedback_rating){
                return res.status(403).send("Feedback already submitted")
            }
            const fbRemarkQuerySnippet = fbRemark ? `'${fbRemark}'` : 'null';
            await client.query(`update complaints set feedback_rating ='${fbRating}' , feedback_remark=${fbRemarkQuerySnippet} where complaint_id=${complaintId}`)
            return res.status(202).send()
        }
        else{
            return res.status(401).send()
        }
    } catch (e){
        console.log(e)
        return res.status(500).send(e.detail)
    }
})

router.delete('/client/complaints/:complaintid', auth, async (req, res) => {

        try {
            const result = await client.query(
                `SELECT * from complaints where complaint_id = ${req.params.complaintid}`
            );
            
            if(result.rows.length == 0){
                return res.status(401).send('No Complaint registered');
            }

            if(result.rows[0].user_id !== req.headers.userID) {
                return res.status(401).send('Access denied');
            }

            const {
                // user_id,
                status, images} = result.rows[0];

            if (status == 'completed'){
                return res.status(401).send('Cannot Delete Completed Request')
            }

            if(images != null){
                fileManager.deleteFiles(images.map((im: string) =>
                // user_id+"-"+
                im));
            }

            await client.query(
                `DELETE from complaints where complaint_id = ${req.params.complaintid}`
            );

            return res.status(200).send('Complaint Removed')
    
        } catch (e) {
            return res.status(500).send('Server Error')
        }
    
    })


export default router