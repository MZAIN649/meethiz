let express = require('express');
let router = express.Router();
var sql = require('mssql/msnodesqlv8');
var nodemailer = require('nodemailer');
var bodyParser = require('body-parser');
let middleware = require('../middleware');
const {
    poolPromise
} = require('../database/db');
const {
    json
} = require('body-parser');
const {
    sq
} = require('date-fns/locale');


router.post('/addstoreitemRec', middleware.checkToken, async (req, res) => {
    
    try {
        const pool = await poolPromise;
        try {
            const recordset = await pool.request().input('recDate', sql.DateTime, req.body.recDate)
                .input('InvoiceNo', sql.Text, req.body.InvoiceNo)
                .input('PONumber', sql.Text, req.body.invNo)
                .input('Discount', sql.Int, req.body.Discount)
                .input('recSubData', sql.Text, req.body.recSub)
                .input('EmployeeId', sql.Text, req.body.EmployeeId)
                .input('ISROCompleted', sql.Int, req.body.ISROCompleted)
                .execute('StoreItemRec');
            res.json(recordset.returnValue);
            
        } catch (queryErr) {
            
            res.status(406).send("Something went wrong  " + queryErr);
        }
    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});


router.post('/updateStoreRec', middleware.checkToken, async (req, res) => {
    
    try {
        const pool = await poolPromise;
        try {
            const recordset = await pool.request().input('mainId', sql.Int, req.body.mainId)
                .input('recDate', sql.DateTime, req.body.recDate)
                .input('invoiceNo', sql.Int, req.body.invNo)
                .input('PONumber', sql.Text, req.body.PONumber)
                .input('Discount', sql.Int, req.body.Discount)
                .input('recSubData', sql.Text, req.body.recSub)
                .input('EmployeeId', sql.Text, req.body.EmployeeId)
                .execute('UpdateStoreItemRec');
            res.json(recordset.returnValue);
            
        } catch (queryErr) {
            
            res.status(406).send("Something went wrong  " + queryErr);
        }
    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});

router.get('/CheckDuplicateInvoice', async (req, res) => {
    try {
        
        const pool = await poolPromise;
        let duplicate_flag = 0;
        let duplicate_check_query = " select count(*) as invoice from StoreItemReceivedMain where InvoiceNO  = '" + req.query.InvNo + "' ";
        
        try {
            const recordset = await pool.request().query(duplicate_check_query);
            
            
            duplicate_flag = recordset.recordset[0].invoice;
            
            // return;
            if (duplicate_flag > 0) {
                res.send({
                    duplicate: req.query.InvNo
                });
            } else {
                res.send({
                    duplicate: 'false'
                })
            }

        } catch (err) {
            res.status(406).send("Something went wrong  " + queryErr);
            return;
        }
    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});

router.get('/getInvoice', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "select InvoiceNo from PurchasedOrderMain";
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
router.post('/deleteStoreItemrecieved', async (req, res) => {
    // 
    // 
    // 
    // return;
    try {
        const pool = await poolPromise;
        try {
            
            const recordset = await pool.request()
                .input('user_id', sql.Int, req.body.user_id)
                .input('mainId', sql.Int, req.body.mainId)
                .execute('DeleteStoreItemRec');
            
            // 
            res.json(recordset);
        } catch (queryErr) {
            
            res.status(406).send("Something went wrong  " + queryErr);
        }
    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});

router.get('/getAllRecord', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        // let query = " select StoreItemReceivedMain.Store_Receive_Main_ID as mainId,[user].Firstname+' '+[User].Lastname as EmployeeName,InvoiceNo,CONVERT(varchar,ReceiveDate,107) as ReceivedDate from StoreItemReceivedMain  " +
        //     " inner join [User] on StoreItemReceivedMain.Receive_Emp_Id=[User].Userid "

        let query =`select StoreItemReceivedMain.StoreItemReceivedMainID as mainId,[user].Firstname+' '+[User].Lastname as EmployeeName,
        StoreItemReceivedMain.InvoiceNo,StoreItemReceivedMain.ISROCompleted,StoreItemReceivedMain.PONumber,CONVERT(varchar,ReceiveDate,107) as ReceivedDate, PurchasedOrderMain.VendorId, VendorDetails.VendorName  from StoreItemReceivedMain
        INNER JOIN [User] on StoreItemReceivedMain.ReceiveEmpId=[User].Userid INNER JOIN PurchasedOrderMain 
        ON PurchasedOrderMain.InvoiceNo = StoreItemReceivedMain.PONumber INNER JOIN VendorDetails
        ON VendorDetails.VendorId = PurchasedOrderMain.VendorId`
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
router.get('/getreport', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        try {
            const recordset = await pool.request()
                .input('VendorId', sql.Int, req.query.VendorId)
                .input('InvoiceNo', sql.VarChar, req.query.InvoiceNo)
                .input('startDate', sql.Date, req.query.startDate)
                .input('endDate', sql.Date, req.query.endDate)
                .execute('selectstoreitemreceived');
            res.json(recordset.recordset);
        } catch (queryErr) {
            
            res.status(406).send("Something went wrong  " + queryErr);
        }
    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});
router.get('/getAllStoreItemSentById', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        try {
            const recordset = await pool.request().input('regNo', sql.Int, req.query.regno)
                .execute('PackageHistoryById');
            res.json(recordset.recordset);
            
        } catch (queryErr) {
            
            res.status(406).send("Something went wrong  " + queryErr);
        }
    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});
router.get('/getrecordbyinvoice', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        // let query = " select StoreItemReceivedMain.Store_Receive_Main_ID as mainId,[user].Firstname+' '+[User].Lastname as EmployeeName,InvoiceNo,CONVERT(varchar,Receive_Date,107) as ReceivedDate from StoreItemReceivedMain  " +
        //     " inner join [User] on StoreItemReceivedMain.Receive_Emp_Id=[User].Userid "

        let query = "select StoreItemReceivedMain.Store_Receive_Main_ID as mainId,[user].Firstname+' '+[User].Lastname as EmployeeName," +
            " StoreItemReceivedMain.InvoiceNo,StoreItemReceivedMain.IS_RO_Completed,StoreItemReceivedMain.PONumber,CONVERT(varchar,Receive_Date,107) as ReceivedDate, PurchasedOrderMain.VendorId, VendorDetails.VendorName  from StoreItemReceivedMain" +
            " INNER JOIN [User] on StoreItemReceivedMain.Receive_Emp_Id=[User].Userid INNER JOIN PurchasedOrderMain " +
            " ON PurchasedOrderMain.InvoiceNo = StoreItemReceivedMain.PONumber INNER JOIN VendorDetails " +
            " ON VendorDetails.VendorId = PurchasedOrderMain.VendorId where PurchasedOrderMain.VendorId = '"+req.query.VendorId+"'AND InvoiceNo = '"+req.query.InvoiceNo+"'" 
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
router.get('/getrecord', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        // let query = " select StoreItemReceivedMain.Store_Receive_Main_ID as mainId,[user].Firstname+' '+[User].Lastname as EmployeeName,InvoiceNo,CONVERT(varchar,Receive_Date,107) as ReceivedDate from StoreItemReceivedMain  " +
        //     " inner join [User] on StoreItemReceivedMain.Receive_Emp_Id=[User].Userid "

        let query = "select StoreItemReceivedMain.StoreItemReceivedMainID as mainId,[user].Firstname+' '+[User].Lastname as EmployeeName," +
            " StoreItemReceivedMain.InvoiceNo,StoreItemReceivedMain.ISROCompleted,StoreItemReceivedMain.PONumber,CONVERT(varchar,ReceiveDate,107) as ReceivedDate, PurchasedOrderMain.VendorId, VendorDetails.VendorName  from StoreItemReceivedMain" +
            " INNER JOIN [User] on StoreItemReceivedMain.ReceiveEmpId=[User].Userid INNER JOIN PurchasedOrderMain " +
            " ON PurchasedOrderMain.InvoiceNo = StoreItemReceivedMain.PONumber INNER JOIN VendorDetails " +
            " ON VendorDetails.VendorId = PurchasedOrderMain.VendorId where PurchasedOrderMain.VendorId = '"+req.query.VendorId + "'" 
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

router.get('/deletestoreitemsub', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "delete from StoreItemReceivedSub where StoreItemReceivedSubid= '" + req.query.id + "'";
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

router.get('/getEditStoreRecData', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
               let query = `Select p.Id as ItemCode,p.ItemName,p.ItemId,q.StoreItemReceivedSubId as subId,p.InvoiceNo as PONumber,p.Quantity as originalqty, 
             isnull(p.TotalPrice,0) as originalprice,  p.Quantity as ItemOrigQty,
             isnull(q.ItemQty,0) as receivedqty, q.BatchNo as BatchNo,q.Rate as Rate,q.Discount as Discount, q.ItemQty as ItemQty,
             isnull(q.ISROCompleted,0) as ISROCompleted,isnull(q.UpdateStatus,0) as storeitemrecsubstatus, 
             CONVERT(varchar,q.ReceiveDate,23) as recDate,CONVERT(varchar,q.Exp,23) as expiryDate,q.InvoiceNo as InvoiceNo, 
             (isnull(p.Quantity,0)-isnull(allrec.ItemQty,0)) as remaingqty from( 
             select StoreItems.Id,PurchasedOrderMain.InvoiceNo,StoreItems.ItemName,PurchasedOrderSub.ItemId, 
             PurchasedOrderSub.Quantity,PurchasedOrderSub.TotalPrice from PurchasedOrderMain inner join 
             PurchasedOrderSub on  PurchasedOrderMain.POIDMain=PurchasedOrderSub.Poidmain inner join StoreItems on 
             PurchasedOrderSub.ItemId=StoreItems.Id  where Invoiceno =(select PONumber from StoreItemReceivedMain where StoreItemReceivedMainID =` +req.query.mainId+ `)) p 
             left join( 
             select maintab.StoreItemReceivedMainID,maintab.ReceiveEmpId,maintab.ReceiveDate, 
             maintab.InvoiceNo,maintab.PONumber,maintab.Discount,maintab.ISROCompleted, 
             subtab.ItemCode,subtab.ItemQty, 
             subtab.BatchNo,subtab.alert,subtab.[StoreItemReceivedSubId],subtab.UpdateStatus, 
             subtab.Exp, subtab.Inspection,subtab.Rate,subtab.PartyId,subtab.ItemOrigQty 
             from StoreItemReceivedMain as maintab left join StoreItemReceivedSub as 
             subtab on maintab.StoreItemReceivedMainID=subtab.StoreItemReceivedMainID 
             where maintab.StoreItemReceivedMainID=` +req.query.mainId+ `) q on p.ItemId=q.ItemCode
             left join(
                select StoreItemReceivedSub.ItemCode,
                sum(isnull(StoreItemReceivedSub.ItemQty,0)) as ItemQty
                from StoreItemReceivedMain left join StoreItemReceivedSub on 
                StoreItemReceivedMain.StoreItemReceivedMainID=StoreItemReceivedSub.StoreItemReceivedMainID
                where StoreItemReceivedMain.PONumber='` + req.query.inv + `'
                group by StoreItemReceivedSub.ItemCode ) allrec on p.ItemId = allrec.ItemCode    
             `;

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

router.get('/getDatabyitem', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "select * from PurchasedOrderMain inner join PurchasedOrderSub on " +
            " PurchasedOrderMain.POIDMain=PurchasedOrderSub.POIDMain where PurchasedOrderMain.InvoiceNo='" + req.query.invoiceId + "' and PurchasedOrderSub.ItemId='" + req.query.itemid + "'";
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
router.get('/getinvoicedata', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "select ItemName, StoreItemReceivedSub.StoreItemReceivedMainID,StoreItemReceivedSub.ItemCode,StoreItemReceivedSub.ItemQty as Rec_Qty,StoreItemReceivedSub.Rate as Unit_Price,(StoreItemReceivedSub.ItemQty*StoreItemReceivedSub.Rate) as Total_Price,StoreItemReceivedSub.ReceiveDateSub as Receive_Date,StoreItemReceivedMain.InvoiceNo as Invoice_No from StoreItemReceivedSub inner join StoreItems on storeItems.Id = StoreItemReceivedSub.ItemCode inner join StoreItemReceivedMain on StoreItemReceivedMain.StoreItemReceivedMainID = StoreItemReceivedSub.StoreItemReceivedMainID  where StoreItemReceivedSub.StoreItemReceivedMainID = '"+ req.query.Id+"'"

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
router.get('/getrecord', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        // let query = " select StoreItemReceivedMain.Store_Receive_Main_ID as mainId,[user].Firstname+' '+[User].Lastname as EmployeeName,InvoiceNo,CONVERT(varchar,Receive_Date,107) as ReceivedDate from StoreItemReceivedMain  " +
        //     " inner join [User] on StoreItemReceivedMain.Receive_Emp_Id=[User].Userid "

        let query = "select StoreItemReceivedMain.StoreItemReceivedMaindID as mainId,[user].Firstname+' '+[User].Lastname as EmployeeName "
        + " StoreItemReceivedMain.InvoiceNo,StoreItemReceivedMain.ISROCompleted,StoreItemReceivedMain.PONumber,CONVERT(varchar,ReceiveDate,107) as ReceivedDate, PurchasedOrderMain.VendorId, VendorDetails.VendorName  from StoreItemReceivedMain "
        + " INNER JOIN [User] on StoreItemReceivedMain.ReceiveEmpId=[User].Userid INNER JOIN PurchasedOrderMain "
        + "  ON PurchasedOrderMain.InvoiceNo = StoreItemReceivedMain.PONumber INNER JOIN VendorDetails "
        + "  ON VendorDetails.VendorId = PurchasedOrderMain.VendorId where PurchasedOrderMain.VendorId ='"+req.query.VendorId + "'" 
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
router.get('/ReceivingSlipData', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        // let query = " select StoreItemReceivedMain.Store_Receive_Main_ID as mainId,[user].Firstname+' '+[User].Lastname as EmployeeName,InvoiceNo,CONVERT(varchar,Receive_Date,107) as ReceivedDate from StoreItemReceivedMain  " +
        //     " inner join [User] on StoreItemReceivedMain.Receive_Emp_Id=[User].Userid "

        let query =" select Sub.*,StoreItems.ItemName,City.Name as Cname,Main.*, PatientInformation.PatientFirstName + ' ' + PatientInformation.PatientLastName as PatientName from StoreItemSentMain as Main inner join PatientInformation on PatientInformation.RegNumber = main.RegNo inner join StoreItemSentSub as Sub on  Sub.StoreItemSentMainId = Main.StoreItemSentMainId inner join StoreItems on Sub.ItemId = StoreItems.Id inner join City on Main.City = City.Id where Main.PackageId ='"+req.query.id + "'" 

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
router.get('/updateStoreItemRec', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "UPDATE StoreItems set itemquantitytotal ='" + req.query.item_quantity + "' WHERE  Id ='" + req.query.ItemId + "' ";
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

    router.post('/duplicateCheckEntry', async (req, res) => {
        try {
            const pool = await poolPromise;
            let duplicate_flag = 0;
            let duplicate_check_query = "SELECT * FROM StoreItems WHERE ItemName = '" + req.body.ItemName + "' ";
            
            try {
                const recordset = await pool.request().query(duplicate_check_query);
                
                
                duplicate_flag = recordset.recordset.length;
                // return;
                if (duplicate_flag > 0) {
                    res.send({
                        duplicate: 'true'
                    });
                } else {
                    res.send({
                        duplicate: 'false'
                    })
                }

            } catch (err) {
                res.status(406).send("Something went wrong  " + queryErr);
                return;
            }
        } catch (err) {
            res.status(406)
            res.send(err.message)
        }
    });
});
//#endregion

module.exports = router;