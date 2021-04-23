import adminAuth from '../middleware/admin-auth'
import express from 'express'
import admin from '../../postgres'

const router = express.Router()

router.get('/admin/complaints', adminAuth, async (req, res) => {

    const {status, zone, dateFrom, dateTo} = req.body;

    try{
        const result = await admin.query(
            `select _location, created_time, status from complaints 
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

router.get('/admin/complaints/:complaintid', adminAuth, async (req: any,res: any) => {
    try {
        const result = await admin.query(
            'select * from complaints where complaint_id = $1',
            [req.params.complaintid],
        );
        
        if(result.rowCount === 0) {
            return res.status(404).send('Complaint Not Found');
        }

        const {complaint_id, description, _location, waste_type, zone, status, created_time, completed_time, images, feedback_rating, feedback_remark, admin_remark} = result.rows[0];
        return res.status(200).send({complaint_id, description, _location, waste_type, zone, status, created_time, completed_time, images, feedback_rating, feedback_remark, admin_remark})

    } catch (e) {
        return res.status(500).send('Server Error')
    }
})

router.patch('/admin/complaints/:complaintid', adminAuth, async (req: any, res: any) => {
    const updateKeys = Object.keys(req.body)
    
    const allowedUpdates = ['status', 'remark']
    
    const isValidUpdate = updateKeys.every((updateKey) => allowedUpdates.includes(updateKey));
    
    if (!isValidUpdate){
        return res.status(400).send('Invalid Updates')
    }

    const setValues : string[] = []

    if (req.body.status){
        setValues.push(`status = '${req.body.status}'`)
    }
    if (req.body.remark){
        setValues.push(`admin_remark = '${req.body.remark}'`)
    }

    if (req.body.status === "Completed"){
        setValues.push(`completed_time = '${new Date().toISOString()}'`)
    } else if (req.body.status){
        setValues.push(`completed_time = null`)
    }
    
    try {
        await admin.query(`update complaints set ${setValues.join(',')} where complaint_id = ${req.params.complaintid};`)
        return res.status(200).send('Value Updated')
    } catch (e)
    {
        return res.status(500).send(e.detail)
    }

})

export default router