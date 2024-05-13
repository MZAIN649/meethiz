//#region declaration
let express = require('express');
let router = express.Router();
var sql = require('mssql/msnodesqlv8');
var nodemailer = require('nodemailer');
var bodyParser = require('body-parser');
let middleware = require('../middleware');
const { poolPromise } = require('../database/db');
const { json } = require('body-parser');

router.get('/getchildInfo', middleware.checkToken, async (req, res) => 
{
    try {
        const pool = await poolPromise;
        let query = "SELECT ROW_NUMBER() OVER(Partition by RegNumber ORDER BY UpdateTime) AS priority,PatientFirstName+' '+isnull(PatientLastName,'') as pname, City,"+
        " ResidentialAddress, "+
        " convert (varchar,CreatedDate,103) as firstcontact, case when  FatherName is null  then GuardianName else FatherName end as GuardianName , FatherContact, "+ 
                        "  GuardianCNIC,  RegStatus, Comments, ReferredBy, convert (varchar,UpdateTime,107) as lastcontact, RegNumber, GuardianOccupation, GuardianContact "+
        " FROM     PatientInformation order by lastcontact desc";
        try {
            
            const recordset = await pool.request().query(query);
            if (recordset) {
                res.send(recordset.recordset);
                
            }
            else {
                res.send([]);
            }
        }
        catch (queryErr) {
            res.status(406).send("Something went wrong  " + queryErr);
            return;
        }
    }
    catch (err) {
        res.status(406)
        res.send(err.message)
    }
});

router.post('/updateRegstatus', async (req, res) => {
    try {
        
        const pool = await poolPromise;
        let query = "UPDATE PatientInformation SET RegStatus ='"+ req.query.statusid +"' WHERE RegNumber ='"+req.query.id+"'";
        try {
            const recordset = await pool.request().query(query);
            if (recordset) {
                res.send(true);
            }
            else {
                res.send(false);
            }
        }
        catch (queryErr) {
            res.status(406).send("Something went wrong  " + queryErr);
            return;
        }
    }
    catch (err) {
        res.status(406)
        res.send(err.message)
    }
});




module.exports = router;