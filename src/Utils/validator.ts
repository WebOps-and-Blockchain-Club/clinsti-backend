import validator from "validator";
import fileManager from './file';

function isValid(req: any, res: any, next: any) {
    const {name, email, password} = req.body;

    if(req.path === "/api/signup"){
        if(!name) {
            return res.status(406).send("Please enter your name.");
        } else if (!email) {
            return res.status(406).send("Please enter your email to register.");
        } else if (!password) {
            return res.status(406).send("Please enter your password.");
        } else if (!validator.isEmail(email)) {
            return res.status(406).send("Please enter a valid Email.");
        } else if ((password.toLowerCase().includes('password')) || password.length < 5) {
            return res.status(406).send("Please enter strong password.");
        }
    } else if (req.path === "/api/signin") {
        if (!email) {
            return res.status(406).send("Please enter your registered email.");
        } else if (!password) {
            return res.status(406).send("Please enter your password.");
        } else if (!validator.isEmail(email)) {
            return res.status(406).send("Please enter a valid Email.");
        }
    } else if (req.path === "/api/editaccount") {
        if(password){
            if ((password.toLowerCase().includes('password')) || password.length < 5) {
                return res.status(406).send("Please enter strong password.");
            }
        }
    } else if(req.path === "/api/feedback"){
        if(!req.body.feedback || req.body.feedback.length < 10){
            return res.status(406).send("Please write few more word.");
        }
    } else if(req.path === "/api/complaint") {
        // Validates complaint resource queries

        if (req.method === "POST"){
            const {description, location} = req.body
            if (!description || !location){
                fileManager.deleteFiles(fileManager.extractFilenames(req))
                return res.status(400).send("Bad Request: Description or Location is empty")
            }
            if (!validator.isLength(description,{min:5})){
                fileManager.deleteFiles(fileManager.extractFilenames(req))
                return res.status(400).send("Description should be minimum length 5")
            } else if (!validator.isLength(location,{min: 5})){
                fileManager.deleteFiles(fileManager.extractFilenames(req))
                return res.status(400).send("Location should be minimum length  5")
            }
        }
    }

    next();
};

export default isValid;