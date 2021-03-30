import validator from "validator";

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
    }

    next();
};

export default isValid;