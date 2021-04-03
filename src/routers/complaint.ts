import express from 'express';
import multer from 'multer';
import client from '../../postgres';
import validate from '../Utils/validator'
import fileManager from '../Utils/file'
import auth from '../middleware/auth';
import path from 'path';

var storage = multer.diskStorage({
    destination: fileManager.imageDirectory,
    filename: function(req,file,cb) {
        const filetype = file['mimetype'].split('/')[1]
        const filename = fileManager.createFilename(filetype, req.headers.userID)
        cb(null, filename)
    }
})
var upload = multer({storage: storage});


const router = express.Router();

router.post('/api/complaints',auth ,upload.array('images',10), validate,async (req, res) => {
    
    const {description, location} = req.body

    var filenames = fileManager.extractFilenames(req)
    

    let createdTime = new Date().toISOString()
    
    // image filename array value to be inserted to table
    let imagefilenames = filenames.length>0 
        ? `'{"${Array.from(filenames,
                    (filename)=>filename.split('_').slice(1).join("")
                    ).join('","')}"}'`
        : 'null'
    console.log(filenames)
    console.log(imagefilenames)
    
    try {
        await client.query(`insert into complaints (user_id,description,_location,status,created_time,images) values ('${req.headers.userID}','${description}','${location}','posted','${createdTime}',${imagefilenames})`)
    } catch (e)
    {
        fileManager.deleteFiles(filenames)
        return res.status(500).send(e.detail)
    }
    
    
    return res.status(201).send()
})

router.get('/api/complaints/:complaintId', auth, async (req, res) => {

    try {
        const result = await client.query(
            'select * from complaints where complaint_id = $1',
            [req.params.complaintId],
        );
        
        if(result.rowCount === 0) {
            return res.status(404).send('Complaint Not Found');
        }

        if(result.rows[0].user_id !== req.headers.userID) {
            return res.status(401).send('Access denied');
        }

        const {complaint_id, description, _location, status, created_time, completed_time, images, feedback_rating, feedback_remark} = result.rows[0];
        return res.status(200).send({complaint_id, description, _location, status, created_time, completed_time, images, feedback_rating, feedback_remark})

    } catch (e) {
        return res.status(500).send('Server Error')
    }

})

router.get('/api/complaints', auth, async (req, res) => {
    try{
        const result = await client.query(
            'select complaint_id, _location, created_time, status from complaints where user_id = $1',
            [req.headers.userID]
        );
        if(result.rowCount === 0){
            return res.status(404).send('No Complaint Registered yet!')
        }
        return res.status(200).send(result.rows);
    }
    catch (e) {
        return res.status(500).send('Server Error');
    }
})

router.get('/api/images/:imageName', auth, async (req, res) => {
    try {
        const imagePath = path.join(fileManager.imageDirectory, req.params.imageName)
        return res.status(200).sendFile(imagePath);
    } catch {
        return res.status(500).send('Server Error')
    }
})

router.post('/api/complaints/:complaintId/feedback', auth, validate, async (req, res)=>{

    const complaintId = req.params.complaintId
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

router.delete('/api/complaints/:complaintId', auth, async (req, res) => {

        try {
            const result = await client.query(
                `SELECT * from complaints where complaint_id = ${req.params.complaintId}`
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
                `DELETE from complaints where complaint_id = ${req.params.complaintId}`
            );

            return res.status(200).send('Complaint Removed')
    
        } catch (e) {
            return res.status(500).send('Server Error')
        }
    
    })


export default router