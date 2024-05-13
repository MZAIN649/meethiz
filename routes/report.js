//#region declaration
let express = require('express');
let router = express.Router();
var sql = require('mssql/msnodesqlv8');
var nodemailer = require('nodemailer');
var bodyParser = require('body-parser');
let middleware = require('../middleware');
const { poolPromise } = require('../database/db');
const { json } = require('body-parser');

router.get('/getItemDataold',async (req, res) => {
    try {
        const pool = await poolPromise;
           let query = "select p.ItemName,p.ReceiveDate as DateofINout,isnull(p.inQty,0) as inQty,ISNULL(p.outQty,0) as outQty  ,  "+
        " p.IssueToDeptId,p.report, isnull((CONVERT(int,isnull(inQty,0))-CONVERT(int, isnull(outQty,0))),0) as balanceQty,p.CreateDate from  "+
        " (  select r.ItemName,r.RDate as  "+
            " ReceiveDate,   (isnull(r.ItemQty,0) - isnull(i.ItemQty,0) + (select isnull(sum(ItemQty),0) from   StoreItemIssueSub  where   "+ 
            " StoreItemIssueSub.StoreItemIssueSubId=0	 )) as   inQty,null as outQty,null as IssueToDeptId,'ARemainingQty' as report,'' as CreateDate from  "+
            " (select StoreItems.id as  "+
                " id,ItemName,StoreItems.ItemCode,  sum(ItemQty) as ItemQty   ,StoreItemReceivedMain.ReceiveDate as RDate  "+
                " from StoreItemReceivedSub inner join  "+
                " StoreItems on  StoreItems.Id=StoreItemReceivedSub.ItemCode inner join StoreItemReceivedMain  on    "+
                " StoreItemReceivedSub.StoreItemReceivedMainID=StoreItemReceivedMain.StoreItemReceivedMainID   group by ItemName,  "+
                " StoreItems.ItemCode,StoreItemReceivedMain.ReceiveDate,StoreItems.Id ) r    Left join  "+
                " (select ItemName,StoreItems.ItemCode,StoreItems.id as id,sum(ItemQty) as ItemQty,  StoreItemIssueMain.IssueDate as "+
                "  RDate from StoreItemIssueSub  inner join StoreItems on   StoreItems.Id=StoreItemIssueSub.ItemId inner join StoreItemIssueMain  "+
                "  on  StoreItemIssueSub.StoreItemIssueId=  StoreItemIssueMain.StoreItemIssueId  group by ItemName, StoreItems.ItemCode, "+
                "  StoreItemIssueMain.IssueDate,  StoreItems.Id ) i on i.ItemCode = r.ItemCode   where r.id='"+req.query.item+"' and "+
                "  r.RDate<convert(varchar,'2021-10-03',23)  union  select StoreItems.ItemName,  StoreItemReceivedMain.ReceiveDate, "+
                " StoreItemReceivedSub.ItemQty   as inQty,null as outQty,null as IssueToDeptId,  'BReceivedQty' as report , "+
                " StoreItemReceivedMain.CreateDate as CreateDate from  "+
                " StoreItemReceivedMain inner join StoreItemReceivedSub  on    "+
                " StoreItemReceivedMain.StoreItemReceivedMainID=StoreItemReceivedSub.StoreItemReceivedMainID  inner join "+
                " StoreItems on StoreItemReceivedSub.ItemCode=StoreItems.Id where   StoreItemReceivedSub.ItemCode='"+req.query.item+"'  "+
                " and StoreItemReceivedMain.ReceiveDate    between convert(varchar,'"+req.query.sdate+"',23)and convert(varchar,'"+req.query.edate+"',23) "+ 
        " union   select StoreItems.ItemName,StoreItemIssueMain.IssueDate,null as inQty,StoreItemIssueSub.ItemQty   as  "+
        " outQty,StoreItemIssueMain.IssueToDeptId,'CIssuedQty' as report,StoreItemIssueMain.CreateDate as CreateDate from StoreItemIssueMain inner join StoreItemIssueSub    "+
        " on StoreItemIssueMain.StoreItemIssueId=StoreItemIssueSub.StoreItemIssueId  inner join StoreItems on   "+
        " StoreItemIssueSub.ItemId=StoreItems.Id where StoreItemIssueSub.ItemId='"+req.query.item+"'  and StoreItemIssueMain.IssueDate   "+ 
        " between convert(varchar,'"+req.query.sdate+"',23) and convert(varchar,'"+req.query.edate+"',23)) p   order by CreateDate ";
        
        
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

// Update Purchased Order
router.get('/allItemReport', middleware.checkToken, async (req, res) => {
    
    
    
    try {
        const pool = await poolPromise;
        try {
            const recordset = await pool.request()
                .input('startDate', sql.Date, req.query.startDate)
                .execute('AllItemReport');
            res.json(recordset.recordset);

        } catch (queryErr) {
            
            res.status(406).send("Something went wrong  " + queryErr);
        }
    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});



// Update Purchased Order
router.get('/getItemData', middleware.checkToken, async (req, res) => {
    
    
    
    try {
        const pool = await poolPromise;
        try {
            const recordset = await pool.request()
                .input('startDate', sql.Date, req.query.sdate)
                .input('endDate', sql.Date, req.query.edate)
                .input('itemcode', sql.Int, req.query.item)
                .execute('ItemInOutReport');
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