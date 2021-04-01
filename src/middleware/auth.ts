import {jwtDecode} from '../Utils/jwt';
import fileManager from '../Utils/file'

const auth = async (req: any, res: any, next: any) => {
    const jwttoken = req.headers['authorization'].replace('Bearer ', '')

    const {id:userId, error} = await jwtDecode(jwttoken)
    // if(error) {
    //     return res.status(401).send(error)
    // }
    if(error) {
        if(req.files){
            fileManager.deleteFiles(fileManager.extractFilenames(req))
        }
        return res.status(400).send(error)
    }

    req.body.userID = userId;
    next();
}

export default auth;