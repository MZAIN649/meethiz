//#region Declaration
let express = require('express');
let router = express.Router();
let format = require('date-fns/format');
let middleware = require('../middleware');
const { poolPromise } = require('../database/db');
const { sql } = require('../database/db');
//#endregion
//REGISTER SHIFT
router.post('/register', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "insert into dbo.Shift  ([Name],[StartTime],[EndTime],[ModifiedDate],[IsArchive]) values('" + req.body.Name + "','" + req.body.StartTime + "','" +
        req.body.EndTime + "',null,'false')";
        
        try {
            const recordset = await pool.request().query(query);
            if (recordset) {
                res.send(true);
                        
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
router.get('/getAllShifts', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "select ShiftID,Name,ltrim(right(convert(varchar(25), StartTime, 100), 7))AS StartTime, " +
        " ltrim(right(convert(varchar(25), EndTime, 100), 7))AS EndTime,convert(varchar,[ModifiedDate], 107)as " +
        " ModifiedDate,IsArchive  from Shift where [IsArchive]='false' ORDER BY ShiftID DESC ";
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

//DELETE SHIFT

router.get('/delete', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "delete from shift where shiftid='"+req.query.ShiftID+"'";
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

//UPDATE SHIFT
router.post('/register', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "update [dbo].[Shift] set [Name]= '" + req.body.Name + "' ," + "[StartTime]='" +
        req.body.StartTime + "' ," + "[EndTime]='" + req.body.EndTime + "' ," + "ModifiedDate='" +
        format(new Date, 'MM/dd/yyyy H:mm:ss') + "'  where [ShiftID] =" + req.body.ShiftID +
        "and IsArchive = 'false'";
        
        try {
            const recordset = await pool.request().query(query);
            if (recordset) {
                res.send(true);
                        
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

// GET SHIFT BY ID 
router.get('/getShiftById', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "select ShiftID,Name, convert(varchar, StartTime, 8) AS StartTime , " +
        "  convert(varchar, EndTime, 8) AS EndTime,convert(varchar,[ModifiedDate], 0)as " +
        "  ModifiedDate,IsArchive  from Shift where [IsArchive]='false' and [ShiftID]=" + req.query.ShiftID;
    " ModifiedDate,IsArchive  from Shift where [IsArchive]='false' ORDER BY ShiftID DESC ";
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

module.exports = router;