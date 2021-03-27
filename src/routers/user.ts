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
        
        //console.log(user.rows.length != 0)
        if (user.rows.length > 0 ){
            return res.status(401).send('Email has registered already');
        }

        const bcryptPassword = await bcrypt.hash(password, 10);

        await client.query('insert into users(user_name, user_email, user_password) values($1, $2, $3)', [name, email, bcryptPassword]);

        const registeredUser = await client.query("select * from users where user_email = $1", [email]);
        const userjwtToken = jwtToken(registeredUser.rows[0].user_id);

        return res.status(201).send({name, userjwtToken});
    } catch (e) {
        //console.log('Error: ' + e)
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

        //return console.log(password, user.rows[0].user_password);
        const password_check = await bcrypt.compare(password, user.rows[0].user_password)
        if (!password_check){
            return res.status(401).send('Invalid Credentials');
        }

        const userjwtToken = jwtToken(user.rows[0].user_id);
        const name = user.rows[0].user_name
        return res.status(201).send({name, userjwtToken});
    } catch (e) {
        return res.status(500).send(e.detail)
    }
});

router.patch('/api/editaccount', validate, async (req, res) => {
    const {name, password} = req.body;

    const a = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQ5NzUwMWRjLWZjMjMtNDYxMC05Mzk5LTU2NGE3M2UzMGEyOSIsImlhdCI6MTYxNjgxNTkyNX0.8pa69Xulualo2x2Z9MM8gWEzJG8dl4gQeZK4t3545Bc";
    try {
        if(name && password){
            await client.query("update users set user_name=$1 where user_id = $2", [name, jwtDecode(a).id]);
            const bcryptPassword = await bcrypt.hash(password, 10);
            await client.query("update users set user_password=$1 where user_id=$2", [bcryptPassword, jwtDecode(a).id]);
            return res.status(201).send("Profile name and Password Updated")
        }
        else if(name){
            await client.query("update users set user_name=$1 where user_id = $2", [name, jwtDecode(a).id]);
            return res.status(201).send("Profile name updated")
        } else if (password) {
            const bcryptPassword = await bcrypt.hash(password, 10);
            await client.query("update users set user_password=$1 where user_id=$2", [bcryptPassword, jwtDecode(a).id]);
            return res.status(201).send("Password Updated")
        }
        return res.status(401).send("Bad Request")
    } catch (e) {
        console.log(e)
        return res.status(500).send(e.detail)
    }
    //res.send(user.rows[0])
})

export default router