import validator from "validator";

function isValid(req: any, res: any, next: any) {
    const {name, email, password} = req.body;

    if(req.path === "/api/signup"){
        if(!name) {
            return res.status(406).send("Enter your name");
        } else if (!email) {
            return res.status(406).send("Enter your email to register");
        } else if (!password) {
            return res.status(406).send("Enter your password");
        } else if (!validator.isEmail(email)) {
            return res.status(406).send("Invalid Email");
        } else if ((password.toLowerCase().includes('password')) || password.length < 5) {
            return res.status(406).send("Enter strong password");
        }
    } else if (req.path === "/api/signin") {
        if (!email) {
            return res.status(406).send("Enter your registered email");
        } else if (!password) {
            return res.status(406).send("Enter your password");
        } else if (!validator.isEmail(email)) {
            return res.status(406).send("Invalid Email");
        }
    } else if (req.path === "/api/editaccount") {
        if(password){
            if ((password.toLowerCase().includes('password')) || password.length < 5) {
                return res.status(406).send("Enter strong password");
            }
        }
    }

    next();
};

export default isValid;