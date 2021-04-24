import adminAuth from '../middleware/admin-auth'
import express from 'express'
import admin from '../../postgres'

const router = express.Router()

router.get('/admin/complaints', adminAuth, async (req, res) => {
    
    const zone = req.query.zone?.toString().split(',')
    const status = req.query.status?.toString().split(',')
    let dateFrom = req.query.dateFrom
    let dateTo = req.query.dateTo
    
    const reqLimit = req.query.limit?.toString()
    const reqSkip = req.query.skip?.toString()
    let limit = 10
    let skip = 0

    const setValuesZone : string[] = []
    let zoneStr = "('Hostel','Academics','Other')";
    if(zone){
        zone?.forEach((_zone: string) => {
            setValuesZone.push("'" + _zone + "'")
        });
        zoneStr = "(" + setValuesZone.join(',') + ")"
    }
    
    const setValuesStatus : string[] = []
    let statusStr = "('posted','processing','invalid complaint', 'completed')"
    if(status){
        status?.forEach((_status: string) => {
            setValuesStatus.push("'" + _status + "'")
        });
        statusStr = "(" + setValuesStatus.join(',') + ")"
    }

    if(!dateFrom) {
        dateFrom = new Date(2020-1-1).toISOString()
    }
    if(!dateTo) {
        dateTo = new Date().toISOString()
    }

    if(reqLimit && reqSkip) {
        limit = parseInt(reqLimit)
        skip = parseInt(reqSkip)
    }
    
    try{
        const result = await admin.query(
            `select _location, created_time, status from complaints 
            where status IN ${statusStr} and 
            zone IN ${zoneStr} and
            created_time >= '${dateFrom}' and
            created_time <= '${dateTo}' 
            order by created_time 
            OFFSET ${skip} LIMIT ${limit}`
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