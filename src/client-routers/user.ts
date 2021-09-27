import express from "express";
import client from "../../postgres";
import auth from "../middleware/auth";
import jwtToken from "../Utils/jwt";
import { isChangePassValid, isEditProfileValid, isRequestOTPValid, isResetPassValid, isSignINValid, isSignUPValid } from "../middleware/validator";
import { mail } from "./../Utils/mail";

const bcrypt = require("bcryptjs");

const router = express.Router();

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

router.post('/client/accounts/signup', isSignUPValid, async (req, res) => {
    const {name, email, password} = req.body
    
    try {
        const user = await client.query("select * from users where user_email = $1",[email]);
        
        if (user.rows.length > 0 ){
            return res.status(401).send('Email has registered already');
        }

        const bcryptPassword = await bcrypt.hash(password, 10);

        await client.query('insert into users(user_name, user_email, user_password) values($1, $2, $3)', [name, email, bcryptPassword]);

        const registeredUser = await client.query("select * from users where user_email = $1", [email]);
        const userjwtToken = jwtToken(registeredUser.rows[0].user_id, registeredUser.rows[0].user_password);

        return res.status(201).send({name, userjwtToken});
    } catch (e) {
        return res.status(500).send(e.detail)
    }
});

router.post('/client/accounts/signin', isSignINValid, async (req, res) => {
    const {email, password} = req.body;

    try {
        const user = await client.query("select * from users where user_email = $1", [email]);

        if (user.rows.length === 0) {
            return res.status(401).send('User not registered')
        }

        const password_check = await bcrypt.compare(password, user.rows[0].user_password)
        if (!password_check){
            return res.status(401).send('Invalid Credentials');
        }

        const userjwtToken = jwtToken(user.rows[0].user_id, user.rows[0].user_password);
        const name = user.rows[0].user_name

        return res.status(200).send({name, userjwtToken});
    } catch (e) {
        return res.status(500).send(e.detail)
    }
});

router.get('/client/accounts', auth,  async (req, res) => {

    try {
        const results =  await client.query(
            'select * from users where user_id = $1',
            [req.headers.userID]
        );
        const name = results.rows[0].user_name;
        const email = results.rows[0].user_email
        return res.status(200).send({name , email});

    } catch (e) {
        return res.status(500).send(e.detail)
    }
})

router.patch('/client/accounts', auth, isEditProfileValid, async (req, res) => {
    const { name } = req.body;
    try {
        await client.query(`update users set user_name = '${name}' where user_id = '${req.headers.userID}'`);

        return res.status(200).send("Profile Updated");  
    } catch (e) {
        console.log(e);
        return res.status(400).send("Update Failed")
    }
})

router.post('/client/accounts/changepassword', auth, isChangePassValid, async (req, res) => {
    const {oldPassword, newPassword} = req.body;

    try {
        const user = await client.query("select * from users where user_id = $1", [req.headers.userID]);

        if (user.rows.length === 0) {
            return res.status(401).send('Invalid Credentials')
        }

        const password_check = await bcrypt.compare(oldPassword, user.rows[0].user_password)
        if(!password_check) {
            return res.status(401).send('Invalid Password');
        }
        const bcryptnewPassword = await bcrypt.hash(newPassword, 10);

        await client.query('update users set user_password = $1', [bcryptnewPassword]);

        const registeredUser = await client.query("select * from users where user_id = $1", [req.headers.userID]);
        const userjwtToken = jwtToken(registeredUser.rows[0].user_id, registeredUser.rows[0].user_password);
        const name = registeredUser.rows[0].user_name

        return res.status(200).send({name, userjwtToken});
    } catch (e) {
        return res.status(400).send("Password Update Failed")
    }
})

router.get('/client/accounts/resetpassword', isRequestOTPValid, async (req, res) => {
    const { email } = req.body;

    try {
        const user = await client.query(`select * from users where user_email = '${email}'`);

        if (user.rows.length === 0) {
            return res.status(401).send('User not registered')
        }

        const otp = generateOTP();
        await client.query(`UPDATE users set password_otp = '${otp}' where user_id = '${user.rows[0].user_id}'`);

        const name = user.rows[0].user_name;
        await mail({ name, email, otp });
        return res.status(200).send({"message" : "OTP Sent!"});

    } catch (e) {
        return res.status(500).send(e.detail);
    }
})

router.post('/client/accounts/resetpassword', isResetPassValid, async (req, res) => {
    const { email, otp, password } = req.body;

    try {
        const user = await client.query(`select * from users where user_email = '${email}'`);

        if (user.rows.length === 0) {
            return res.status(401).send('User not registered')
        }

        if(user.rows[0].password_otp !== otp ) {
            return res.status(401).send("Invalid OTP!");
        }

        const bcryptPassword = await bcrypt.hash(password, 10);
        await client.query(`UPDATE users set user_password = '${bcryptPassword}', password_otp = ${null} where user_id = '${user.rows[0].user_id}'`);

        return res.status(200).send({"message" : "Password updated"});

    } catch (e) {
        return res.status(500).send(e.detail);
    }
})

export default router