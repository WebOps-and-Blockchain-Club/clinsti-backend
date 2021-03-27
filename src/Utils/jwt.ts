const jwt = require("jsonwebtoken");
import * as dotenv from "dotenv";
dotenv.config();

function jwtToken(user_id: any) {
    return jwt.sign({id: user_id}, process.env.jwtSecret)
}

function jwtDecode(token: any) {
    return jwt.decode(token)
}

export {jwtToken, jwtDecode};