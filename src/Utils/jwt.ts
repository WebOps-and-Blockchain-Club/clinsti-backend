const jwt = require("jsonwebtoken");
import * as dotenv from "dotenv";
dotenv.config();

function jwtToken(user_id: String) {
    return jwt.sign({_id: user_id}, process.env.jwtSecret, { expiresIn: '30days'})
}

function jwtDecode(token: String) {
    var decoded = jwt.verify(token, process.env.jwtSecret)
    return decoded._id
}

export {jwtToken, jwtDecode};