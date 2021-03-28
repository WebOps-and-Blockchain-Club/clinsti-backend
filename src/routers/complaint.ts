import express from 'express';
import multer from 'multer';
import client from '../../postgres';
import { jwtDecode } from '../Utils/jwt';
import fs from 'fs'

var storage = multer.diskStorage({
    destination: './images/',
    filename: function(_req,file,cb) {
        const filename = Date.now() + '-' + Math.round(Math.random()*1E9) + '.' + file['mimetype'].split('/')[1]
        cb(null, filename)
    }
})
var upload = multer({storage: storage});


const router = express.Router();

router.post('/api/complaint', upload.array('images',10),async (req, res) =>{
    // reverting type errors
    const body = JSON.parse(JSON.stringify(req.body));
    const files = JSON.parse(JSON.stringify(req.files))

    const {description, jwtToken, location} = body

    let filenames = new Array<string>()
    
    files.forEach((file : {filename: string}) => {
        filenames.push(file.filename);
    })

    let removefile = (filename : string) =>{fs.unlink('./images/'+filename, ()=>{})}

    if (!description || !jwtToken || !location){
        filenames.forEach(removefile)
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
        filenames.forEach
        return res.status(400).send("bad token")
    }

    let createdTime = new Date().toISOString()
    let imageQuery = filenames.length>0 ? `'{"${filenames.join('","')}"}'`: 'null'
    
    try {
        await client.query(`insert into complaints (user_id,description,_location,status,created_time,images) values ('${userId}','${description}','${location}','posted','${createdTime}',${imageQuery})`)
    } catch (e)
    {
        console.log(e)
        filenames.forEach(removefile)
        return res.status(400).send(e)
    }
    
    
    return res.status(201).send()
})


export default router