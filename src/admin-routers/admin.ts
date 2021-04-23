import express from "express";
import client from "../../postgres";
import jwtToken from "../Utils/jwt";
import validate from "../middleware/validator";

const bcrypt = require("bcryptjs");

const router = express.Router();

router.post('/admin', validate, async (req, res) => {
  const {email, password} = req.body;

  try {
      const admin = await client.query("select * from admin where admin_email = $1", [email]);
      
      if (admin.rows.length === 0) {
          return res.status(401).send('User not registered')
      } else if (admin.rows.length !== 1) {
        return res.status(401).send('Bad Request');
      }

      const password_check = await bcrypt.compare(password, admin.rows[0].admin_password)
      if (!password_check){
          return res.status(401).send('Invalid Credentials');
      }

      const adminjwtToken = jwtToken(admin.rows[0].user_id, admin.rows[0].admin_password);
      const admin_name = admin.rows[0].admin_name

      return res.status(200).send({admin_name, adminjwtToken});
  } catch (e) {
      return res.status(500).send(e.detail)
  }
});

export default router
