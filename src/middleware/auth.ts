import client from '../../postgres';
const jwt = require("jsonwebtoken");

const auth = async (req: any, res: any, next: any) => {

    const jwttoken = req.headers['authorization']?.replace('Bearer ', '');

    try {

    const decoded = jwt.verify(jwttoken, process.env.jwtSecret)

    const user = await client.query('select * from users where user_id = $1 and user_password = $2', [decoded._id, decoded._password]);
    if (user) {
        req.headers.userID = user.rows[0].user_id;
        if(user.rows[0].user_verified === false) return res.status(400).send("User Not Verified")
        next();
        }
    } catch (e) {
        return res.status(400).send('Invalid Credentials')
    }
}

export default auth;