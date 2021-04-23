import client from '../../postgres';
const jwt = require("jsonwebtoken");

const adminAuth = async (req: any, res: any, next: any) => {

    const jwttoken = req.cookies.token;

    try {

    const decoded = jwt.verify(jwttoken, process.env.jwtSecret)

    const admin = await client.query('select * from admin where admin_id = $1 and admin_password = $2', [decoded._id, decoded._password]);
    if (admin) {
        req.headers.adminID = admin.rows[0].admin_id;
        next();
        }
    } catch (e) {
        return res.status(400).send('Invalid Credentials')
    }
}

export default adminAuth;