import express from "express";
import client from "../../postgres";
import auth from "../middleware/auth";
import { isFeedbackValid } from "../middleware/validator";
const router = express.Router();

router.post('/client/feedback', auth, isFeedbackValid, async (req, res) => {
    const {feedback,feedback_type} = req.body
    let createdTime = new Date().toISOString()

    try {
        await client.query(`insert into feedback(user_id, created_time, feedback,feedback_type) values('${req.headers.userID}', '${createdTime}','${feedback}' , '${feedback_type}')`);
        return res.status(201).send("Thanks for feedback");
    } catch (e) {
        return res.status(500).send(e.detail)
    }
});

export default router