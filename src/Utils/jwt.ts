const jwt = require("jsonwebtoken");
import * as dotenv from "dotenv";
import client from "../../postgres";
dotenv.config();

function jwtToken(user_id: String) {
    return jwt.sign({_id: user_id}, process.env.jwtSecret, { expiresIn: '30days'})
}

async function jwtDecode(token: String) {
    try {
        const decoded = jwt.verify(token, process.env.jwtSecret)
        if (await client.query('select * from users where user_id = $1', [decoded._id])){
            return {id:decoded._id, error: undefined}
        }
        return {id: undefined, error: "User Does not Exist"}
    }
    catch (e) {
        return {id: undefined, error :"invalid Token"}
    }
}

export {jwtToken, jwtDecode};