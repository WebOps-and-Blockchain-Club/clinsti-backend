import {jwtDecode} from '../Utils/jwt';

const auth = async (req: any, res: any, next: any) => {
    const jwttoken = req.headers['authorization']?.replace('Bearer ', '')

    if(!jwttoken) {
        return res.status(401).send("Please Login")
    }

    const {id:userId, error} = await jwtDecode(jwttoken)
    if(error) {
        return res.status(401).send(error)
    }

    req.body.userID = userId;
    next();
}

export default auth;