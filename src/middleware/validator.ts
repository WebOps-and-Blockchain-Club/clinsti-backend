import { Validator } from "class-validator";
//import validator1 from "validator";
import { ChangePassword, EditProfile, SignIN, SignUP } from "../Models/Account";
//import { wasteTypeValues, zoneValues } from "../config";
import { StatusUpdate, ComplaintFeedback, NewComplaint } from "../Models/Complaint";
import { Feedback } from "../Models/Feedback";
import fileManager from '../Utils/file';

const validator = new Validator();

export function isSignUPValid(req: any, res: any, next: any) {
    const signUP = new SignUP()
    signUP.name = req.body.name;
    signUP.email = req.body.email;
    signUP.password = req.body.password;

    validator.validate(signUP).then( (result) => {
        if(result.length !==0) if(result[0].constraints) return res.status(400).send((Object.values(result[0].constraints).join(", ")))
        next()
    })
}

export function isSignINValid(req: any, res: any, next: any) {
    const signIN = new SignIN()
    signIN.email = req.body.email;
    signIN.password = req.body.password;

    validator.validate(signIN).then( (result) => {
        if(result.length !==0) if(result[0].constraints) return res.status(400).send((Object.values(result[0].constraints).join(", ")))
        next()
    })
}

export function isEditProfileValid(req: any, res: any, next: any) {
    const updatekeys = Object.keys(req.body);

    if(updatekeys.length === 0 ) return res.status(400).send('Invalid updates!')

    const allowedkeyupdates = ['name', 'email'];
    const isupdates = updatekeys.every((updatekey) => allowedkeyupdates.includes(updatekey));

    if (!isupdates) {
        return res.status(400).send('Invalid updates!')
    }

    const editProfile = new EditProfile()
    editProfile.name = req.body.name;
    editProfile.email = req.body.email;

    validator.validate(editProfile).then( (result) => {
        if(result.length !==0) if(result[0].constraints) return res.status(400).send((Object.values(result[0].constraints).join(", ")))
        next()
    })
}

export function isChangePassValid(req: any, res: any, next: any) {
    const changePassword = new ChangePassword()
    changePassword.oldPassword = req.body.oldPassword;
    changePassword.newPassword = req.body.newPassword;

    validator.validate(changePassword).then( (result) => {
        if(result.length !==0) if(result[0].constraints) return res.status(400).send((Object.values(result[0].constraints).join(", ")))
        next()
    })
}

export function isNewComplaintValid(req: any, res: any, next: any) {
    const newComplaint = new NewComplaint();
    newComplaint.description = req.body.description;
    newComplaint.location = req.body.location;
    newComplaint.wasteType = req.body.wasteType;
    newComplaint.zone = req.body.zone

    validator.validate(newComplaint).then( (result) => {
        if(result.length !==0) if(result[0].constraints) return res.status(400).send((Object.values(result[0].constraints).join(", ")))
        next()
    })
}

export function isComplaintFeedbackValid(req: any, res: any, next: any) {
    const complaintFeedback = new ComplaintFeedback();
    complaintFeedback.fbRating = req.body.fbRating;
    complaintFeedback.fbRemark = req.body.fbRemark;

    validator.validate(complaintFeedback).then( (result) => {
        if(result.length !==0) {
            if(result[0].constraints) {
                fileManager.deleteFiles(fileManager.extractFilenames(req))
                return res.status(400).send((Object.values(result[0].constraints).join(", ")))
            }
        }
        next()
    })
}

export function isStatusUpdateValid(req: any, res: any, next: any) {

    const updateKeys = Object.keys(req.body)
    const allowedUpdates = ['status', 'remark']
    const isValidUpdate = updateKeys.every((updateKey) => allowedUpdates.includes(updateKey));
    
    if (!isValidUpdate) return res.status(400).send('Invalid Updates')

    const statusUpdate = new StatusUpdate();
    statusUpdate.status = req.body.status;
    statusUpdate.remark = req.body.remark;

    validator.validate(statusUpdate).then( (result) => {
        if(result.length !==0) if(result[0].constraints) return res.status(400).send((Object.values(result[0].constraints).join(", ")))
        next()
    })
}

export function isFeedbackValid(req: any, res: any, next: any) {
    const feedback = new Feedback();
    feedback.feedback_type = req.body.feedback_type;
    feedback.feedback = req.body.feedback;

    validator.validate(feedback).then( (result) => {
        if(result.length !==0) if(result[0].constraints) return res.status(400).send((Object.values(result[0].constraints).join(", ")))
        next()
    })
}

// function isValid(req: any, res: any, next: any) {
//     const {name, email, password, oldPassword, newPassword} = req.body;

//     if(req.path === "/client/accounts/signup"){
//         if(!name) {
//             return res.status(406).send("Please enter your name.");
//         } else if (!email) {
//             return res.status(406).send("Please enter your email to register.");
//         } else if (!password) {
//             return res.status(406).send("Please enter your password.");
//         } else if (!validator1.isEmail(email)) {
//             return res.status(406).send("Please enter a valid Email.");
//         } else if ((password.toLowerCase().includes('password')) || password.length < 5) {
//             return res.status(406).send("Please enter strong password.");
//         }
//     } else if (req.path === "/client/accounts/signin" || req.path === "/admin") {
//         if (!email) {
//             return res.status(406).send("Please enter your registered email.");
//         } else if (!password) {
//             return res.status(406).send("Please enter your password.");
//         } else if (!validator1.isEmail(email)) {
//             return res.status(406).send("Please enter a valid Email.");
//         }
//     } else if (req.path === "/client/accounts") {

//         if (req.method === 'PATCH') {
//             if(!name) {
//                 return res.status(406).send("Please enter your name.");
//             } else if (!email) {
//                 return res.status(406).send("Please enter your email to register.");
//             } else if (!validator1.isEmail(email)) {
//                 return res.status(406).send("Please enter a valid Email.");
//             }
//         }

//     } else if (req.path === "/client/accounts/changepassword") {
//         if(!oldPassword) {
//             return res.status(406).send("Please enter your Old Paaword");
//         } else if (!newPassword) {
//             return res.status(406).send("Please enter your new password.");
//         } else if ((newPassword.toLowerCase().includes('password')) || newPassword.length < 5) {
//             return res.status(406).send("Please enter strong password.");
//         }
//     }else if(req.path === "/client/feedback"){
//         if(!req.body.feedback || req.body.feedback.length < 10){
//             return res.status(406).send("Please write few more word.");
//         }
//     } 
    // else if(req.path === "/client/complaints") {
    //     // Validates CRUD to complaints resource

    //     if (req.method === "POST"){
    //         // Validates Create complaint
    //         const {description, location, wasteType, zone} = req.body
    //         if (!description || !location){
    //             fileManager.deleteFiles(fileManager.extractFilenames(req))
    //             return res.status(400).send("Description or Location is empty")
    //         }
    //         if (typeof(description) !== "string"){
    //             fileManager.deleteFiles(fileManager.extractFilenames(req))
    //             return res.status(400).send("Expected descriptiion type for rating")
    //         }
    //         if (typeof(location) !== "string"){
    //             fileManager.deleteFiles(fileManager.extractFilenames(req))
    //             return res.status(400).send("Expected location type for remark")
    //         }
    //         if (!zoneValues.includes(zone)){
    //             fileManager.deleteFiles(fileManager.extractFilenames(req))
    //             return res.status(400).send("Invalid zone")
    //         }
    //         if (!wasteTypeValues.includes(wasteType)){
    //             fileManager.deleteFiles(fileManager.extractFilenames(req))
    //             return res.status(400).send("Invalid waste type")
    //         }
    //         if (!validator1.isLength(description,{min:5})){
    //             fileManager.deleteFiles(fileManager.extractFilenames(req))
    //             return res.status(400).send("Description should be minimum length 5")
    //         } 
    //         if (!validator1.isLength(location,{min: 5})){
    //             fileManager.deleteFiles(fileManager.extractFilenames(req))
    //             return res.status(400).send("Location should be minimum length  5")
    //         }
    //     }
    // } else if(/\/client\/complaints\/\d+\/feedback/.test(req.path)){
    //     // Validates post feedback rating and feedback remark
    //     const {fbRating, fbRemark} = req.body
    //     if (!fbRating){
    //         return res.status(400).send("Feedback Rating is missing")
    //     }
    //     if (typeof(fbRating) !== "number"){
    //         return res.status(400).send("Expected number type for rating")
    //     }
    //     if (fbRating<1 || fbRating>5){
    //         return res.status(400).send("Rating should be between 1 and 5, inclusive")
    //     }
    //     if(!fbRemark){
    //         return next()
    //     }
    //     if (typeof(fbRemark) !== "string"){
    //         return res.status(400).send("Expected string type for remark")
    //     }
    //     if (!validator1.isLength(fbRemark,{min:5})){
    //         return res.status(400).send("Remark should be minimum lenght 5")
    //     }
    // }
//
//     next();
// };
//
// export default isValid;