import fs from 'fs';
import path from 'path'

const imageDirectory = path.resolve('./images')

function extractFilenames (req: Express.Request){
    // reverting type errors
    const files = JSON.parse(JSON.stringify(req.files))
    let filenames = new Array<string>()
    
    // extract filenames of stored images
    files.forEach((file : {filename: string}) => {
        filenames.push(file.filename);
    })

    return filenames
}

function deleteFiles(filenames: Array<string>){
    filenames.forEach((filename)=>{
        try{
            fs.unlink(imageDirectory + path.sep + filename, ()=>{})
        } catch (e){
            console.log(e)
        }
    })   
}

function _randomFilename(filetype: string, uuid: string) {
    return uuid + '_' + Date.now() + '-' + Math.round(Math.random()*1E9) + '.' + filetype
}


function createFilename(filetype: string, uuid: any){
    var filename = _randomFilename(filetype, uuid)
    while (fs.existsSync(imageDirectory + filename)){
        filename = _randomFilename(filetype, uuid)
    }
    return filename
}



export default {deleteFiles, createFilename, extractFilenames, imageDirectory};