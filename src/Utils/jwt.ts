const jwt = require("jsonwebtoken");
import * as dotenv from "dotenv";
import client from "../../postgres";
dotenv.config();

function jwtToken(user_id: String) {
    return jwt.sign({_id: user_id}, process.env.jwtSecret, { expiresIn: '30days'})
}

function jwtDecode(token: String) {
    var decoded = jwt.verify(token, process.env.jwtSecret)
    client.query('select * from users where user_id = $1', [decoded._id])
    .then(() => decoded._id)
}

export {jwtToken, jwtDecode};