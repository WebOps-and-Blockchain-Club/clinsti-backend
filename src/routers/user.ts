import express from "express";
import client from "../../postgres";
import { jwtToken , jwtDecode } from "../Utils/jwt";
import validate from "../Utils/validator";

const bcrypt = require("bcryptjs");

const router = express.Router();

router.post('/api/signup', validate, async (req, res) => {
    const {name, email, password} = req.body
    
    try {
        const user = await client.query("select * from users where user_email = $1",[email]);
        
        if (user.rows.length > 0 ){
            return res.status(401).send('Email has registered already');
        }

        const bcryptPassword = await bcrypt.hash(password, 10);

        await client.query('insert into users(user_name, user_email, user_password) values($1, $2, $3)', [name, email, bcryptPassword]);

        const registeredUser = await client.query("select * from users where user_email = $1", [email]);
        const userjwtToken = jwtToken(registeredUser.rows[0].user_id);

        return res.status(201).send({name, userjwtToken});
    } catch (e) {
        return res.status(500).send(e.detail)
    }
});

router.post('/api/signin', validate, async (req, res) => {
    const {email, password} = req.body;

    try {
        const user = await client.query("select * from users where user_email = $1", [email]);

        if (user.rows.length === 0) {
            return res.status(401).send('Invalid Credentials')
        }

        const password_check = await bcrypt.compare(password, user.rows[0].user_password)
        if (!password_check){
            return res.status(401).send('Invalid Credentials');
        }

        const userjwtToken = jwtToken(user.rows[0].user_id);
        const name = user.rows[0].user_name

        return res.status(200).send({name, userjwtToken});
    } catch (e) {
        return res.status(500).send(e.detail)
    }
});

router.patch('/api/editprofile', validate, async (req, res) => {

    const updatekeys = Object.keys(req.body);
    const allowedkeyupdates = ['user_name', 'user_password'];
    const isupdates = updatekeys.every((updatekey) => allowedkeyupdates.includes(updatekey));

    const jwttoken = req.headers['authorization']?.replace('Bearer ', '')
    
    if(!jwttoken) {
        return res.status(401).send("Please Login")
    }
    const {id:userid, error} = await jwtDecode(jwttoken)
    if(error) {
        return res.status(401).send(error)
    }

    if (!isupdates) {
        return res.status(400).send('Invalid updates!')
    }

    try {
        updatekeys.forEach(async (updatekey) => {

            if(updatekey === 'user_password') {
                req.body[updatekey] = await bcrypt.hash(req.body[updatekey], 10);
            }
            
            const str = 'update users set ' + updatekey + ' = $1 where user_id = $2';
            await client.query(str,[req.body[updatekey], userid]);
        });
        return res.send('Profile Updated')
    } catch (e) {
        return res.status(500).send(e.detail)
    }
})

export default router