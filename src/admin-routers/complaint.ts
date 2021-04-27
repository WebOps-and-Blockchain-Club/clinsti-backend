import adminAuth from '../middleware/admin-auth'
import express from 'express'
import admin from '../../postgres'
import fileManager from '../Utils/file'
import path from 'path'

const Json2csvParser = require('json2csv').Parser;

const router = express.Router()

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

router.get('/admin/complaints', adminAuth, async (req, res) => {
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
       
        const result = await admin.query(queryStr)
        
        if(result.rowCount === 0){
            return res.status(404).send('No Complaint Registered yet!')
        }
        return res.status(200).send(result.rows);
    }
    catch (e) {
        return res.status(500).send('Server Error');
    }
});

router.get('/admin/complaints/:complaintid', adminAuth, async (req: any,res: any) => {
    try {
        const result = await admin.query(
            'select * from complaints where complaint_id = $1',
            [req.params.complaintid],
        );
        
        if(result.rowCount === 0) {
            return res.status(404).send('Complaint Not Found');
        }

        const {complaint_id,user_id, description, _location, waste_type, zone, status, created_time, completed_time, images, feedback_rating, feedback_remark, admin_remark} = result.rows[0];
        return res.status(200).send({complaint_id,user_id, description, _location, waste_type, zone, status, created_time, completed_time, images, feedback_rating, feedback_remark, admin_remark})

    } catch (e) {
        return res.status(500).send('Server Error')
    }
})

router.patch('/admin/complaints/:complaintid', adminAuth, async (req: any, res: any) => {
    const updateKeys = Object.keys(req.body)
    
    const allowedUpdates = ['status', 'remark']
    
    const isValidUpdate = updateKeys.every((updateKey) => allowedUpdates.includes(updateKey));
    
    if (!isValidUpdate){
        return res.status(400).send('Invalid Updates')
    }

    const setValues : string[] = []

    if (req.body.status){
        setValues.push(`status = '${req.body.status}'`)
    }
    if (req.body.remark){
        setValues.push(`admin_remark = '${req.body.remark}'`)
    }

    if (req.body.status === "completed"){
        setValues.push(`completed_time = '${new Date().toISOString()}'`)
    } else if (req.body.status){
        setValues.push(`completed_time = null`)
    }
    
    try {
        await admin.query(`update complaints set ${setValues.join(',')} where complaint_id = ${req.params.complaintid};`)
        return res.status(200).send('Value Updated')
    } catch (e)
    {
        return res.status(500).send(e.detail)
    }

})

router.get('/admin/piechart', adminAuth, async (_req, res) => {

    const zone = ['0', 'Academics','Hostel','Other']
    const status = ["posted", "processing", "invalid_complaint", "completed"]
    const waste_type = ['Plastic','Debris','Other']

    try {
        let setJSONValues : string[] = []
        for (const _zone of zone) {
            let setValues : string[] = []
            let queryStr = 'select * from complaints where '
            if(_zone != zone[0]) queryStr += "zone = '" + _zone + "' and "

            for ( const _status of status) {
                const result = await admin.query(queryStr + `status = '${_status}'`)
                setValues.push(`"${_status}": ${result.rowCount}`)
            }

            for ( const _waste_type of waste_type) {
                const result = await admin.query(queryStr + `waste_type = '${_waste_type}'`)
                setValues.push(`"${_waste_type}": ${result.rowCount}`)
            }

            setJSONValues.push(JSON.parse('{' + setValues.join(",") + '}'))
        }
        res.status(200).send({'All Zones':setJSONValues[0],'Academics Zone':setJSONValues[1],'Hostel Zone':setJSONValues[2],'Other Zone':setJSONValues[3]})
    } catch {
        res.status(500).send('Server Error')
    }
})

router.get('/admin/report', adminAuth, async (req, res) => {

    const zone = req.query.zone?.toString().split(',')
    const status = req.query.status?.toString().split(',')
    let dateFrom = req.query.dateFrom
    let dateTo = req.query.dateTo

    const zoneStr = strFun(zone)
    const statusStr = strFun(status)

    try {
        const setValues: string[] = []
        if(zoneStr) setValues.push('zone IN ' + zoneStr)
        if(statusStr) setValues.push('status IN ' + statusStr)
        if(dateFrom) setValues.push(`created_time >= '${dateFrom}'`)
        if(dateTo) setValues.push(`created_time <= '${dateTo}'`)
        const queryStr1 = setValues.join(' and ')

        let queryStr = 'select complaint_id, description, _location, waste_type, zone, status, created_time, completed_time, feedback_rating, feedback_remark, admin_remark from complaints '
        if(queryStr1) queryStr += 'where '+ queryStr1
        queryStr += ' order by created_time DESC'

        const result = await admin.query(queryStr)

        const jsonData = JSON.parse(JSON.stringify(result.rows));
        const json2csvParser = new Json2csvParser();
        const csvData = json2csvParser.parse(jsonData);
        
        res.setHeader('Content-disposition', 'attachment; filename=complaints.csv');
        res.set('Content-Type', 'text/csv');
        res.status(200).end(csvData);
    } catch {
        res.status(500).send('Server Error')
    }

})

router.get('/admin/images/:imagename', adminAuth, async (req, res) => {

    try {
        const imagePath = path.join(fileManager.imageDirectory,req.params.imagename);

        if(!fileManager.isFileExists(imagePath)) {
            return res.status(404).send('File doesnot Exists')
        }

        return res.status(200).sendFile(imagePath);
    } catch {
        return res.status(500).send('Server Error')
    }
})

export default router