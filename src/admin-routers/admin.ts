import express from "express";
import client from "../../postgres";
import jwtToken from "../Utils/jwt";
import { isSignINValid } from "../middleware/validator";

const bcrypt = require("bcryptjs");

const router = express.Router();

router.post('/admin', isSignINValid, async (req, res) => {
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

      const adminjwtToken = jwtToken(admin.rows[0].admin_id, admin.rows[0].admin_password);

      return res.status(200).cookie("token", adminjwtToken, {httpOnly:true, maxAge:1000*60*60*24*3 }).json(true);
  } catch (e) {
      return res.status(500).send(e.detail)
  }
});

router.delete('/admin', async(_req ,res) => {
  res.cookie("token", "", { httpOnly:true, maxAge:1 }).json(false)
});

export default router
