import express from 'express';
import client from '../../postgres';
import adminAuth from '../middleware/admin-auth';

const router = express.Router();

router.get('/admin/complaints', adminAuth, async (req, res) => {

    const {status, zone} = req.body;

    try{
        const result = await client.query(
            `select _location, created_time, status from complaints 
            where status IN ${status} and 
            zone IN ${zone}`
        );
        
        if(result.rowCount === 0){
            return res.status(404).send('No Complaint Registered yet!')
        }
        return res.status(200).send(result.rows);
    }
    catch (e) {
        return res.status(500).send('Server Error');
    }
});

export default router
