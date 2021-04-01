const jwt = require("jsonwebtoken");
import * as dotenv from "dotenv";
//import client from "../../postgres";
dotenv.config();

function jwtToken(user_id: String, user_password: String) {
    return jwt.sign({_id: user_id, _password: user_password}, process.env.jwtSecret, { expiresIn: '30days'})
}

// async function jwtDecode(token: String) {

//     if(token == "test"){
//         // TO BE DELETED, ONLY FOR TESTING , #TBD
//         return {id: "90c1a25f-9849-4e11-b0a7-494c3ffca6ec",error: undefined};
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.jwtSecret)

//         if (await client.query('select * from users where user_id = $1', [decoded._id])){
//             return {id:decoded._id, error: undefined};
//         }

//         return {id: undefined, error: "User Does not Exist"};

//     }
//     catch (e) {
//         return {id: undefined, error :"invalid Token"};
//     }
// }

//export {jwtToken, jwtDecode};
export default jwtToken;