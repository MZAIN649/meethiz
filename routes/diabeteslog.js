let express = require('express');
let router = express.Router();
var sql = require('mssql/msnodesqlv8');
var nodemailer = require('nodemailer');
var bodyParser = require('body-parser');
let middleware = require('../middleware');
const { poolPromise } = require('../database/db');
const { json } = require('body-parser');


router.post('/AddDiabeteslog',async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "Insert into DiabetesLog (MealTaken,MealType,GlucoseBeforeMeal,GlucoseAfterMeal,InsulinDose,Comments,PoiNo,submitedDate) Values('"+req.body.mealtaken+"','"+req.body.mealtype+"','"+ req.body.glubeforemeal+"','"+ req.body.gluaftermeal+"','"+req.body.insulin+"','"+ req.body.comment+"' , '"+req.body.poino +"','"+req.body.date+"') ";
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
router.get('/deleteDiabeteslog',async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "Delete from DiabetesLog where DiabetesLogId='"+ req.query.id+"'";
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
router.post('/updateDiabeteslog',async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "Update  DiabetesLog Set MealTaken='"+req.body.mealtaken+"',MealType='"+req.body.mealtype+"',GlucoseBeforeMeal='"+ req.body.glubeforemeal+"',GlucoseAfterMeal='"+ req.body.gluaftermeal+"',InsulinDose='"+req.body.insulin+"',submitedDate='"+req.body.date+"',Comments='"+ req.body.comment+"' , PoiNo='"+ req.body.poino+"' where DiabetesLogId='"+ req.body.Id+"'";
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
router.get('/GetAllDiabetesLog',async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "select * , convert(varchar,submitedDate,100) as submitedDate1 from DiabetesLog inner join categories on diabeteslog.MealType=categories.categoryid order by [DiabetesLogId] DESC";
        try {
            const recordset = await pool.request().query(query);
            if (recordset) {
                res.send(recordset.recordset);
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
router.get('/GetAllDiabetesLogbyId',async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "select DiabetesLogId,MealTaken,MealType,GlucoseAfterMeal, "+
        " GlucoseBeforeMeal,InsulinDose,Comments,CONVERT(varchar,submitedDate,23) as submitedDate, "+
        " PoiNo from DiabetesLog where DiabetesLogId='"+req.query.id +"'";
        try {
            const recordset = await pool.request().query(query);
            if (recordset) {
                res.send(recordset.recordset);
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


router.get('/getAllPoino',async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "select PoiNo from PatientInformation";
        try {
            const recordset = await pool.request().query(query);
            if (recordset) {
                res.send(recordset.recordset);
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

//#endregion
module.exports = router;