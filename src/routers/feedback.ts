import express from "express";
import client from "../../postgres";
import validate from "../Utils/validator";
const router = express.Router();

router.post('/api/feedback', validate, async (req, res) => {
    const {feedback} = req.body
    
    try {
        await client.query('insert into feedback(feedback) values($1)', [feedback]);
        return res.status(201).send("Thanks for feedback");
    } catch (e) {
        //console.log('Error: ' + e)
        return res.status(500).send(e.detail)
    }
});

export default router