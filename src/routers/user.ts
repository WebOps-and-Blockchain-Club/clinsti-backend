import express from "express";
import client from "../../postgres";
import jwtToken from "../Utils/jwt";
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
        return res.status(400).send(e.detail)
    }
})

export default router