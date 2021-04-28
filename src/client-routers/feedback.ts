import express from "express";
import client from "../../postgres";
import validate from "../middleware/validator";
const router = express.Router();

router.post('/client/feedback', validate, async (req, res) => {
    const {feedback,feedback_type} = req.body
    let createdTime = new Date().toISOString()

    try {
        await client.query(`insert into feedback(created_time, feedback,feedback_type) values( '${createdTime}','${feedback}' , '${feedback_type}')`);
        return res.status(201).send("Thanks for feedback");
    } catch (e) {
        return res.status(500).send(e.detail)
    }
});

export default router