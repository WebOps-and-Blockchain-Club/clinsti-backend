import validator from "validator";
import fileManager from './file';

function isValid(req: any, res: any, next: any) {
    const {name, email, password, oldPassword, newPassword} = req.body;

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
        if(!name) {
            return res.status(406).send("Please enter your name.");
        } else if (!email) {
            return res.status(406).send("Please enter your email to register.");
        } else if (!validator.isEmail(email)) {
            return res.status(406).send("Please enter a valid Email.");
        }
    } else if (req.path === "/api/changePassword") {
        if(!oldPassword) {
            return res.status(406).send("Please enter your Old Paaword");
        } else if (!newPassword) {
            return res.status(406).send("Please enter your new password.");
        } else if ((newPassword.toLowerCase().includes('password')) || newPassword.length < 5) {
            return res.status(406).send("Please enter strong password.");
        }
    }else if(req.path === "/api/feedback"){
        if(!req.body.feedback || req.body.feedback.length < 10){
            return res.status(406).send("Please write few more word.");
        }
    } else if(req.path === "/api/complaints") {
        // Validates CRUD to complaints resource

        if (req.method === "POST"){
            // Validates Create complaint
            const {description, location} = req.body
            if (!description || !location){
                fileManager.deleteFiles(fileManager.extractFilenames(req))
                return res.status(400).send("Description or Location is empty")
            }
            if (typeof(description) !== "string"){
                return res.status(400).send("Expected descriptiion type for rating")
            }
            if (typeof(location) !== "string"){
                return res.status(400).send("Expected location type for remark")
            }
            if (!validator.isLength(description,{min:5})){
                fileManager.deleteFiles(fileManager.extractFilenames(req))
                return res.status(400).send("Description should be minimum length 5")
            } 
            if (!validator.isLength(location,{min: 5})){
                fileManager.deleteFiles(fileManager.extractFilenames(req))
                return res.status(400).send("Location should be minimum length  5")
            }
        }
    } else if(/\/api\/complaints\/\d+/.test(req.path)){
        // Validates CRUD to singular complatint in complants resource
        if (req.method === "POST"){
            // Validates Create feedback rating and feedback remark
            const {fbRating, fbRemark} = req.body
            if (!fbRating){
                return res.status(400).send("Feedback Rating is missing")
            }
            if (typeof(fbRating) !== "number"){
                return res.status(400).send("Expected number type for rating")
            }
            if (fbRating<1 || fbRating>5){
                return res.status(400).send("Rating should be between 1 and 5, inclusive")
            }
            if(!fbRemark){
                return next()
            }
            if (typeof(fbRemark) !== "string"){
                return res.status(400).send("Expected string type for remark")
            }
            if (!validator.isLength(fbRemark,{min:5})){
                return res.status(400).send("Remark should be minimum lenght 5")
            }
        }
    }

    next();
};

export default isValid;