import adminAuth from '../middleware/admin-auth'
import express from 'express'
import admin from '../../postgres'
import fileManager from '../Utils/file'
import path from 'path'
import { statusValues, wasteTypeValues, zoneValues } from '../config'
import { isStatusUpdateValid } from '../middleware/validator'

const Json2csvParser = require('json2csv').Parser;

const router = express.Router()

router.get('/admin/complaints', adminAuth, async (req, res) => {
    const zone = req.query.zone?.toString().split(',')
    const status = req.query.status?.toString().split(',')
    let dateFrom = req.query.dateFrom
    let dateTo = req.query.dateTo + 'T23:59:59.999Z'
    
    const reqLimit = req.query.limit?.toString()
    const reqSkip = req.query.skip?.toString()
    let limit = 10
    let skip = 0

    if(reqLimit) limit = parseInt(reqLimit)
    if(reqSkip) skip = parseInt(reqSkip)
  
    try{
        const setValues: string[] = []
        if(zone) setValues.push(`zone IN ('${zone.join("','")}') `)
        if(status) setValues.push(`status IN ('${status.join("','")}') `)
        if(dateFrom) setValues.push(`created_time >= '${dateFrom}'`)
        if(req.query.dateTo) setValues.push(`created_time <= '${dateTo}'`)
        const queryStr1 = setValues.join(' and ')

        let queryStr = 'select complaint_id, _location, created_time, status from complaints '
        if(queryStr1) queryStr += 'where '+ queryStr1
        queryStr += ' order by created_time DESC OFFSET ' + skip + ' LIMIT ' + limit
       
        console.log(queryStr);
        const result = await admin.query(queryStr)

        let countQueryStr = 'select COUNT(*) from complaints ';
        if(queryStr1) countQueryStr += 'where ' + queryStr1;
        const complaintCount = await admin.query(countQueryStr);
        
        if(result.rowCount === 0){
            return res.status(404).send('No Complaint Registered yet!')
        }
        return res.status(200).send({"complaintsCount": complaintCount.rows[0].count, "complaints": result.rows});
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

        const {complaint_id,user_id, description, _location, waste_type, zone, status, created_time, registered_time, work_started_time, completed_time, images, feedback_rating, feedback_remark, admin_remark} = result.rows[0];

        const user = await admin.query(`select user_name, user_email from users where user_id = '${user_id}'`);
        const { user_name, user_email } = user.rows[0];
        
        return res.status(200).send({complaint_id, user_id, user_name, user_email, description, _location, waste_type, zone, status, created_time, registered_time, work_started_time, completed_time, images, feedback_rating, feedback_remark, admin_remark})

    } catch (e) {
        return res.status(500).send('Server Error')
    }
})

router.patch('/admin/complaints/:complaintid', isStatusUpdateValid, adminAuth, async (req: any, res: any) => {

    const setValues : string[] = []

    if (req.body.status){
        setValues.push(`status = '${req.body.status}'`)
    }
    if (req.body.remark){
        setValues.push(`admin_remark = '${req.body.remark}'`)
    }

    if ( req.body.status === statusValues[0] ) {
        setValues.push(`registered_time = null, work_started_time = null, completed_time = null`)
    } else if ( req.body.status === statusValues[1] ) {
        setValues.push(`registered_time = '${new Date().toISOString()}', work_started_time = null, completed_time = null`)
    } else if ( req.body.status === statusValues[2] ) {
        setValues.push(`work_started_time = '${new Date().toISOString()}', completed_time = null`)
    } else if ( req.body.status === statusValues[3] || req.body.status === statusValues[4] ) {
        setValues.push(`completed_time = '${new Date().toISOString()}'`)
    }
    
    try {
        await admin.query(`update complaints set ${setValues.join(',')} where complaint_id = ${req.params.complaintid};`)
        return res.status(200).send('Value Updated')
    } catch (e)
    {
        return res.status(500).send(e.detail)
    }

})

router.get('/admin/piechart', adminAuth, async (_req, res) => {

    try {
        let setJSONValues : string[] = []
        for (const _zone of zoneValues.concat('0')) {
            let setValues : string[] = []
            let queryStr = 'select * from complaints where '
            if(_zone != '0') queryStr += "zone = '" + _zone + "' and "

            for ( const _status of statusValues) {
                const result = await admin.query(queryStr + `status = '${_status}'`)
                setValues.push(`"${_status}": ${result.rowCount}`)
            }

            for ( const _wasteType of wasteTypeValues) {
                const result = await admin.query(queryStr + `waste_type = '${_wasteType}'`)
                setValues.push(`"${_wasteType}": ${result.rowCount}`)
            }

            setJSONValues.push(JSON.parse('{' + setValues.join(",") + '}'))
        }
        res.status(200).send({'All Zones':setJSONValues[3],'Academics Zone':setJSONValues[0],'Hostel Zone':setJSONValues[1],'Residential Zone':setJSONValues[2]})
    } catch {
        res.status(500).send('Server Error')
    }
})

router.get('/admin/report', adminAuth, async (req, res) => {

    const zone = req.query.zone?.toString().split(',')
    const status = req.query.status?.toString().split(',')
    let dateFrom = req.query.dateFrom
    let dateTo = req.query.dateTo + 'T23:59:59.999Z'

    try {
        const setValues: string[] = []
        if(zone) setValues.push(`zone IN ('${zone.join("','")}') `)
        if(status) setValues.push(`status IN ('${status.join("','")}') `)
        if(dateFrom) setValues.push(`created_time >= '${dateFrom}'`)
        if(req.query.dateTo) setValues.push(`created_time <= '${dateTo}'`)
        const queryStr1 = setValues.join(' and ')

        let queryStr = 'select complaint_id, description, _location, waste_type, zone, status, created_time, completed_time, feedback_rating, feedback_remark, admin_remark from complaints '
        if(queryStr1) queryStr += 'where '+ queryStr1
        queryStr += ' order by created_time DESC'

        const result = await admin.query(queryStr)

        result.rows.forEach((_rows) => {
            _rows.created_time = new Date(_rows.created_time).toLocaleString()
            if(_rows.completed_time) _rows.completed_time = new Date(_rows.completed_time).toLocaleString()
        })

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

router.get('/admin/images/:imagename', adminAuth, async (req, res) => {

    try {
        const imagePath = path.join(fileManager.imageDirectory,req.params.imagename);

        if(!fileManager.isFileExists(imagePath)) {
            return res.status(404).send('File doesnot Exists')
        }

        return res.status(200).sendFile(imagePath);
    } catch {
        return res.status(500).send('Server Error')
    }
})

export default router