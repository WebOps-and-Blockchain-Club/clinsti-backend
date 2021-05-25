import adminAuth from '../middleware/admin-auth'
import express from 'express'
import admin from '../../postgres'

const router = express.Router()

router.get('/admin/feedback',adminAuth, async (req, res) => {

    const feedback_type = req.query.feedback_type?.toString().split(',')
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
        if(feedback_type) setValues.push(`feedback_type IN ('${feedback_type.join("','")}') `)
        if(dateFrom) setValues.push(`created_time >= '${dateFrom}'`)
        if(req.query.dateTo) setValues.push(`created_time <= '${dateTo}'`)
        const queryStr1 = setValues.join(' and ')

        let queryStr = 'select * from feedback '
        if(queryStr1) queryStr += 'where '+ queryStr1
        queryStr += ' order by created_time DESC OFFSET ' + skip + ' LIMIT ' + limit

        const result = await admin.query(queryStr)
        
        if(result.rowCount === 0){
            return res.status(404).send('No Feedback yet!')
        }
        return res.status(200).send(result.rows);
    }
    catch (e) {
        return res.status(500).send('Server Error');
    }
});

export default router;