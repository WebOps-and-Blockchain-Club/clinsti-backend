import adminAuth from '../middleware/admin-auth'
import express from 'express'
import admin from '../../postgres'
const Json2csvParser = require('json2csv').Parser;

const router = express.Router()

const strFun = (query: any) => {
    const setValues : string[] = []
    if(!query){
        return;
    }
    query?.forEach((_query: string) => {
        setValues.push("'" +_query + "'")
    });
    return "(" + setValues.join(',') + ")"
}

router.get('/admin/complaints', adminAuth, async (req, res) => {
    const zone = req.query.zone?.toString().split(',')
    const status = req.query.status?.toString().split(',')
    let dateFrom = req.query.dateFrom
    let dateTo = req.query.dateTo
    
    const reqLimit = req.query.limit?.toString()
    const reqSkip = req.query.skip?.toString()
    let limit = 10
    let skip = 0

    const zoneStr = strFun(zone)
    const statusStr = strFun(status)

    if(reqLimit) limit = parseInt(reqLimit)
    if(reqSkip) skip = parseInt(reqSkip)
  
    try{
        const setValues: string[] = []
        if(zoneStr) setValues.push('zone IN ' + zoneStr)
        if(statusStr) setValues.push('status IN ' + statusStr)
        if(dateFrom) setValues.push(`created_time >= '${dateFrom}'`)
        if(dateTo) setValues.push(`created_time <= '${dateTo}'`)
        const queryStr1 = setValues.join(' and ')

        let queryStr = 'select complaint_id, _location, created_time, status from complaints '
        if(queryStr1) queryStr += 'where '+ queryStr1
        queryStr += ' order by created_time DESC OFFSET ' + skip + ' LIMIT ' + limit
       
        const result = await admin.query(queryStr)
        
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

    if (req.body.status === "completed"){
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

router.get('/admin/report', adminAuth, async (req, res) => {

    const zone = req.query.zone?.toString().split(',')
    const status = req.query.status?.toString().split(',')
    let dateFrom = req.query.dateFrom
    let dateTo = req.query.dateTo

    const zoneStr = strFun(zone)
    const statusStr = strFun(status)

    try {
        const setValues: string[] = []
        if(zoneStr) setValues.push('zone IN ' + zoneStr)
        if(statusStr) setValues.push('status IN ' + statusStr)
        if(dateFrom) setValues.push('created_time >= ' + dateFrom)
        if(dateTo) setValues.push('created_time <= ' + dateTo)
        const queryStr1 = setValues.join(' and ')

        let queryStr = 'select complaint_id, description, _location, waste_type, zone, status, created_time, completed_time, feedback_rating, feedback_remark, admin_remark from complaints '
        if(queryStr1) queryStr += 'where '+ queryStr1
        queryStr += ' order by created_time DESC'

        const result = await admin.query(queryStr)

        const jsonData = JSON.parse(JSON.stringify(result.rows));
        const json2csvParser = new Json2csvParser();
        const csvData = json2csvParser.parse(jsonData);
        
        res.setHeader('Content-disposition', 'attachment; filename=complaints.csv');
        res.set('Content-Type', 'text/csv');
        res.status(200).end(csvData);
    } catch {
        res.status(500).send('Server Error')
    }

})

export default router