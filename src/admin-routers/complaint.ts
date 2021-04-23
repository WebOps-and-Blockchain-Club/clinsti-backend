import express from 'express';
import client from '../../postgres';
import adminAuth from '../middleware/admin-auth';

const router = express.Router();

router.get('/admin/complaints',adminAuth, async (req, res) => {

    const {status, zone, dateFrom, dateTo} = req.body;

    try{
        const result = await client.query(
            `select complaint_id, created_time, status from complaints 
            where status IN ${status} and 
            zone IN ${zone} and
            created_time >= '${dateFrom}' and
            created_time <= '${dateTo}'`
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