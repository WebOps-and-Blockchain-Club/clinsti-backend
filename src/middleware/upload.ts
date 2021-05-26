import multer from 'multer';
import fileManager from '../Utils/file'
import path from 'path'

const MEGABYTE_LIMIT = 5
const FILE_LIMIT = 5
const SUPPORTED_EXT = ['.jpg', '.jpeg', '.png', ]

var storage = multer.diskStorage({
    destination: fileManager.imageDirectory,
    filename: function(req,file,cb) {
        const filetype = path.extname(file.originalname)
        const filename = fileManager.createFilename(filetype, req.headers.userID)
        cb(null, filename)
    },
})

function filterImages(_req: any, file: any, cb: any) {
    const extension = path.extname(file.originalname)
    if (SUPPORTED_EXT.includes(extension)){
        return cb(null, true)
    }
    return cb(Error(`File extension not supported; File extensions supported: ${SUPPORTED_EXT}`))
}

var upload = multer({
    storage: storage,
    limits: {
        fileSize: MEGABYTE_LIMIT*1024*1024,
        files: FILE_LIMIT
    },
    fileFilter: filterImages
});

async function multerUpload (req: any, res: any, next: any){
    upload.array('images')(req, res, function(error: any) {
        if(error){
            var errorMessage
            if (error.code === "LIMIT_FILE_SIZE"){
                errorMessage = "File size should be less than " + MEGABYTE_LIMIT + " mb"
            } else if (error.code === "LIMIT_FILE_COUNT"){
                errorMessage = "Number of images should be less than or equal to " + FILE_LIMIT
            }
            errorMessage = errorMessage? errorMessage: error.message
            return res.status(400).send(errorMessage)
        }else{
            return next()
        }
    })
}

export default multerUpload