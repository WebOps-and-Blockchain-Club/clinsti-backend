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

router.post('/api/complaint',upload.array('images',10), validate,async (req, res) =>{
    

    const {description, jwtToken, location} = req.body

    const filenames = fileManager.extractFilenames(req)

    if (!jwtToken){
        fileManager.deleteFiles(filenames)
        return res.status(400).send("bad Request")
    }

    var userId;

    if(jwtToken === "test"){
        // ONLY FOR TEST, TO BE REMOVED
        userId = "90c1a25f-9849-4e11-b0a7-494c3ffca6ec"
    }
    else{
        userId = jwtDecode(jwtToken);
    }
    if(!userId) {
        fileManager.deleteFiles(filenames)
        return res.status(400).send("bad token")
    }

    let createdTime = new Date().toISOString()
    
    // image filename array value to be inserted
    let imagefilenames = filenames.length>0 ? `'{"${filenames.join('","')}"}'`: 'null'
    
    try {
        await client.query(`insert into complaints (user_id,description,_location,status,created_time,images) values ('${userId}','${description}','${location}','posted','${createdTime}',${imagefilenames})`)
    } catch (e)
    {
        console.log(e)
        fileManager.deleteFiles(filenames)
        return res.status(400).send(e)
    }
    
    
    return res.status(201).send()
})


export default router