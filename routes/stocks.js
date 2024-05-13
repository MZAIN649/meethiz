let express = require('express');
let router = express.Router();
var sql = require('mssql/msnodesqlv8');
var nodemailer = require('nodemailer');
var bodyParser = require('body-parser');
let middleware = require('../middleware');
const { poolPromise } = require('../database/db');
const { json } = require('body-parser');


router.post('/addStock', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "insert into dbo.Stocks ([ItemCode] ,[ReceivedQty] ,[ReceivedDate] ,[ExpiryDate] ,[CreatedDate]) values ('" +
        req.body.ItemCode +"','"+req.body.RecQty+"','"+req.body.RecDate +"','"+req.body.ExpiryDate+"', getdate())";
        
        
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

router.get('/getAllRecord', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "select StockId,ItemCode,ReceivedQty,convert(varchar, ReceivedDate, 0) as ReceivedDate,convert(varchar, ExpiryDate, 0) as ExpiryDate from Stocks";
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

router.get('/getStockDataById', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "select StockId,ItemCode,ReceivedQty,convert(varchar, ReceivedDate, 23) as ReceivedDate,convert(varchar, ExpiryDate, 23) as ExpiryDate from Stocks where StockId='"+req.query.StockId+"'";
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

router.post('/updateStock', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "Update dbo.Stocks set ItemCode= '" +
      req.body.ItemCode + "', ReceivedQty='" + req.body.RecQty + "', ReceivedDate='" + req.body.RecDate+ "', ExpiryDate='" + req.body.ExpiryDate+"',Created_Date=getdate() where StockId='"+req.body.StockId+"'";
        
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

//#endregion

module.exports = router;