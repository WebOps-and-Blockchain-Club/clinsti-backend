import express from 'express';
import multer from 'multer';
import client from '../../postgres';
import { jwtDecode } from '../Utils/jwt';
import validate from '../Utils/validator'
import fileManager from '../Utils/file'

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
    

    const {description, jwtToken, location} = req.body

    const filenames = fileManager.extractFilenames(req)

    const {id:userId, error} = await jwtDecode(jwtToken)

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

router.post('/api/complaints/:complaintId',validate,async (req, res)=>{

    const complaintId = req.params.complaintId
    const {fbRating,jwtToken, fbRemark} = req.body

    var {id:userId, error} = await jwtDecode(jwtToken)

    if(error){
        res.status(400).send(error)
    }

    try {
        const queryResult = await client.query(`select user_id from complaints where complaint_id=${complaintId}`)
        if (!queryResult.rows[0]){
            return res.status(404).send()
        }

        const complaintUserId = queryResult.rows[0].user_id
        console.log(complaintUserId, userId)
        if (complaintUserId === userId){
            console.log(fbRating,fbRemark)
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