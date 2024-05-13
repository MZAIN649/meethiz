let express = require('express');
let router = express.Router();
var sql = require('mssql/msnodesqlv8');
var nodemailer = require('nodemailer');
var bodyParser = require('body-parser');
let middleware = require('../middleware');
const { poolPromise } = require('../database/db');
const { json } = require('body-parser');
router.get('/getSearchDataByDateDefault', async (req, res) => {
    try {
        const pool = await poolPromise;
        try {
            const recordset = await pool.request().execute('[dbo].[SearchOrderByCurrentMonth]');
        
            res.json(recordset.recordset);


        } catch (queryErr) {
            
            res.status(406).send("Something went wrong  " + queryErr);
        }
    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});
router.get('/getSearchPackageStatusByDate', async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "  SELECT * FROM PackagesStatus WHERE (ReturnDamageDate BETWEEN '" + req.body.endDate + "'  AND '" + req.body.startDate + "' )"
        try {
            const recordset = await pool.request().query(query);
            
            if (recordset) {
                res.send(recordset.recordset);
            } else {
                res.send([]);
            }
        } catch (queryErr) {
            res.status(406).send("Something went wrong  " + queryErr);
            return;
        }
    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});
router.post('/getSearchDataByDate', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;

        try {
            const recordset = await pool.request().input('startDate', sql.Date, req.body.startDate)
            .input('endDate', sql.Date, req.body.endDate)
            .execute('[dbo].[SearchPatientOrderByDate]');
            res.json(recordset.recordset);


        } catch (queryErr) {
            
            res.status(406).send("Something went wrong  " + queryErr);
        }
    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});
router.post('/postPackageOfPatient', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        try {
            const recordset = await pool.request().input('user', sql.Int, req.body.User)
            .input('regno', sql.Int, req.body.RegNo)
            .input('packageid', sql.Int, req.body.PackageId)
            .execute('[dbo].[PostPackageOfPatient]');
            
            res.json(recordset.recordset);



        } catch (queryErr) {
            
            res.status(406).send("Something went wrong  " + queryErr);
        }
    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});



  
 
module.exports = router;   
