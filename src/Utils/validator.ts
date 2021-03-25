import validator from "validator";

function isValid(req: any, res: any, next: any) {
    const {name, email, password} = req.body;

    if(!name) {
        return res.send("Enter your name");
    } else if (!email) {
        return res.send("Enter your email to register");
    } else if (!password) {
        return res.send("Enter your password");
    } else if (!validator.isEmail(email)) {
        return res.send("Invalid Email");
    } else if ((password.toLowerCase().includes('password')) || password.length < 5) {
        return res.send("Enter strong password");
    }

    next();
};

export default isValid;