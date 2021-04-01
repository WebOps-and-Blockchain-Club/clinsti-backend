import express from 'express';
import multer from 'multer';
import client from '../../postgres';
import { jwtDecode } from '../Utils/jwt';
import validate from '../Utils/validator'
import fileManager from '../Utils/file'
import auth from '../middleware/auth';

var storage = multer.diskStorage({
    destination: fileManager.imageDirectory,
    filename: function(_req,file,cb) {
        const filetype = file['mimetype'].split('/')[1]
        const filename = fileManager.createFilename(filetype)
        cb(null, filename)
    }
})
var upload = multer({storage: storage});


const router = express.Router();

router.post('/api/complaints',upload.array('images',10), validate,async (req, res) =>{
    
    const {description, location} = req.body
    //const {description, jwtToken, location} = req.body

    const filenames = fileManager.extractFilenames(req)

    //const {id:userId, error} = await jwtDecode(jwtToken)
    const jwttoken = req.headers['authorization']?.replace('Bearer ', '')

    if(!jwttoken) {
        return res.status(401).send("Please Login")
    }
    
    const {id:userId, error} = await jwtDecode(jwttoken)
    if(error) {
        return res.status(401).send(error)
    }


    if(error) {
        fileManager.deleteFiles(filenames)
        return res.status(400).send(error)
    }

    let createdTime = new Date().toISOString()
    
    // image filename array value to be inserted to table
    let imagefilenames = filenames.length>0 ? `'{"${filenames.join('","')}"}'`: 'null'
    
    try {
        await client.query(`insert into complaints (user_id,description,_location,status,created_time,images) values ('${userId}','${description}','${location}','posted','${createdTime}',${imagefilenames})`)
    } catch (e)
    {
        fileManager.deleteFiles(filenames)
        return res.status(500).send(e.detail)
    }
    
    
    return res.status(201).send()
})

router.get('/api/complaints/:complaintId', auth, async (req, res) => {

    const complaintId = req.params.complaintId;

    try {
        client.query(
            'select * from complaints where user_id = $1 and complaint_id = $2',
            [req.body.userID, complaintId],
            (error, results) => {
                if (error) {
                    throw error;
                }
                if(results.rowCount === 1) {
                    const {complaint_id, description, _location, status, created_time, completed_time, image, feedback_rating, feedback_remark} = results.rows[0];
                    return res.status(200).send({complaint_id, description, _location, status, created_time, completed_time, image, feedback_rating, feedback_remark})
                }
                return res.status(400).send('Bad Request');
            }
        );
        return null;
    } catch (e) {
        return res.status(500).send(e.detail)
    }

})

router.post('/api/complaints/:complaintId', auth, validate,async (req, res)=>{

    const complaintId = req.params.complaintId
    const {fbRating, fbRemark} = req.body

    try {
        const queryResult = await client.query(`select user_id,feedback_rating from complaints where complaint_id=${complaintId}`)
        if (!queryResult.rows[0]){
            return res.status(404).send()
        }

        const complaintUserId = queryResult.rows[0].user_id
        
        if (complaintUserId === req.body.userID){
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


export default router