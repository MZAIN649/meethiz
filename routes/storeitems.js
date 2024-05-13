//#region declaration
let express = require('express');
let router = express.Router();
var sql = require('mssql/msnodesqlv8');
var nodemailer = require('nodemailer');
var bodyParser = require('body-parser');
let middleware = require('../middleware');
let configg = require('../config');
const {
    poolPromise
} = require('../database/db');
const {
    json
} = require('body-parser');
const {
    compareSync
} = require('bcrypt');

router.get('/FetchById', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "select * from StoreItems where Id='" + req.query.Id + "' ";
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
router.get('/getstorebyInvoice', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        // let query = "Select p.Id,p.ItemName,p.ItemId,p.Invoice,q.ReceiveDateSub,p.Quantity as originalqty,p.TotalPrice as originalprice, " +
        //     " isnull(q.ItemQty,0) as receivedqty,isnull(q.Rate,0) as receivedprice,isnull(q.ISROCompleted,0) as ISROCompleted,isnull(q.UpdateStatus,0) as store_item_rec_sub_status, isnull(q.Item_Orig_Qty,0) as current_quantity, " +
        //     " (isnull(p.Quantity,0)-isnull(q.ItemQty,0)) as remaingqty from( " +
        //     " select StoreItems.Id,PurchasedOrderMain.Invoice,StoreItems.ItemName,PurchasedOrderSub.ItemId, " +
        //     "  PurchasedOrderSub.Quantity,PurchasedOrderSub.TotalPrice from PurchasedOrderMain inner join " +
        //     " PurchasedOrderSub on  PurchasedOrderMain.POIDMain=PurchasedOrderSub.POIDMain inner join StoreItems on " +
        //     " PurchasedOrderSub.ItemId=StoreItems.Id  where Invoice ='" + req.query.id + "') p " +
        //     " left join( " +
        //     " select StoreItemReceivedMain.InvoiceNo,StoreItemReceivedSub.ItemCode,StoreItemReceivedSub.ReceiveDateSub, " +
        //     " isnull(StoreItemReceivedSub.ItemQty,0) as ItemQty,isnull(StoreItemReceivedSub.Rate,0) as Rate,StoreItemReceivedMain.ISROCompleted, StoreItemReceivedSub.UpdateStatus, StoreItemReceivedSub.Item_Orig_Qty " +
        //     " from StoreItemReceivedMain inner join StoreItemReceivedSub on " +
        //     " StoreItemReceivedMain.Store_Receive_Main_ID=StoreItemReceivedSub.Store_Receive_Main_ID " +
        //     " where StoreItemReceivedMain.PONumber='" + req.query.id + "') q on p.ItemId=q.ItemCode"; //'" + req.query.id + "' ";
        let query =`Select p.Id,p.ItemName,p.ItemId,p.InvoiceNo,p.Quantity as originalqty, 
        isnull(p.TotalPrice,0) as originalprice,
        isnull(q.ItemQty,0) as receivedqty, 
        isnull(q.ISROCompleted,0) as ISROCompleted,isnull(q.UpdateStatus,0) as store_item_rec_sub_status, 
        (isnull(p.Quantity,0)-isnull(q.ItemQty,0)) as remaingqty from(
        select StoreItems.Id,PurchasedOrderMain.InvoiceNo,StoreItems.ItemName,PurchasedOrderSub.ItemId, 
        PurchasedOrderSub.Quantity,PurchasedOrderSub.TotalPrice from PurchasedOrderMain inner join 
        PurchasedOrderSub on  PurchasedOrderMain.POIDMain=PurchasedOrderSub.Poidmain inner join StoreItems on 
        PurchasedOrderSub.ItemId=StoreItems.Id  where InvoiceNo='` + req.query.id + `' ) p 
        left join(
        select StoreItemReceivedSub.ItemCode,
        sum(isnull(StoreItemReceivedSub.ItemQty,0)) as ItemQty,
        StoreItemReceivedMain.ISROCompleted, StoreItemReceivedSub.UpdateStatus
        from StoreItemReceivedMain left join StoreItemReceivedSub on 
        StoreItemReceivedMain.StoreItemReceivedMainID=StoreItemReceivedSub.StoreItemReceivedMainID
        where StoreItemReceivedMain.PONumber='` + req.query.id + `' 
        group by StoreItemReceivedSub.ItemCode,StoreItemReceivedMain.ISROCompleted,StoreItemReceivedSub.UpdateStatus ) q on p.ItemId=q.ItemCode `
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
router.get('/checkStoreItemrecByPoNumber', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "select * from StoreItemReceivedMain where PONumber = '" + req.query.id + "'"
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

router.post('/Addstoreitems', middleware.checkToken, async (req, res) => {
    
    try {
        const pool = await poolPromise;

        //     let query = "insert into dbo.StoreItems values ('" +
        //   req.body.ItemCode + "','" + req.body.ItemName + "','" + req.body.Categoryid + "','" +
        //   req.body.Manufacturer + "','" + req.body.ExpireyItem + "','" + req.body.GenericNameId+ "','" + req.body.MinQuantity+"',getdate())";

        try {
            const recordset = await pool.request().input('ItemName', sql.Text, req.body.ItemName)
                .input('CatId', sql.Int, req.body.Categoryid)
                .input('Manufacturer', sql.Text, req.body.Manufacturer)
                .input('ExpiryItem', sql.Int, req.body.ExpireyItem)
                .input('MinAlertQty', sql.Int, req.body.MinQuantity)
                .execute('Create_StoreItems');
            res.send(true);
            
        } catch (queryErr) {
            res.status(406).send("Something went wrong  " + queryErr);
            return;
        }
    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});
router.get('/FetchAll', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        try {
            let query = "select Id,ItemCode,ItemName,Cat_Name,Manufacturer,ExpiryItem,MinAlertQty, convert (varchar,CreatedDate,103) as CreatedDate from StoreItems inner join Item_Category on " +
                "StoreItems.CatId =Item_Category.Cat_Id order by Id desc";

            
            const recordset = await pool.request().query(query);
            if (recordset) {
                res.send(recordset.recordset)
            }


        } catch (queryErr) {
            
            res.status(406).send("Something went wrong  " + queryErr);
        }
    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});
router.post('/UpdateStoreItems', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "Update dbo.StoreItems set ItemName= '" +
            req.body.ItemName + "', CatId='" + req.body.Categoryid + "', Manufacturer='" + req.body.Manufacturer + "', ExpiryItem='" + req.body.ExpireyItem + "', MinAlertQty='" + req.body.MinQuantity + "'" +
            " where ItemCode='" + req.body.ItemCode + "'";
        


        try {
            const recordset = await pool.request().query(query);
            if (recordset) {
                res.send(true);
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

router.get('/deleteStoreItemCheck', middleware.checkToken, async (req, res) => {
    

    // Check if exist in other tables as foreign keys //
    const pool = await poolPromise;
    // let query = "SELECT COUNT(ItemId) as AssignItemVendor_items  from AssignItemVendor where ItemId='" + req.query.id + "' UNION SELECT COUNT(itemId) as packagessub_items FROM packagessub where itemId='" + req.query.id + "' UNION SELECT COUNT(ItemId) as PurchasedOrderSub_items FROM PurchasedOrderSub where ItemId='" + req.query.id + "' ";
    let query = "select AssignItemVendor.AssignId, VendorDetails.VendorName,'vendor' as tabname from AssignItemVendor join VendorDetails on AssignItemVendor.VendorId = VendorDetails.VendorId where ItemId ='" + req.query.id + "' UNION " +
        "select PurchasedOrderSub.Poidsub as AssignId, PurchasedOrderMain.InvoiceNo as VendorName,'invoice' as tabname from PurchasedOrderSub inner join PurchasedOrderMain on PurchasedOrderMain.POIDMain = PurchasedOrderSub.POIDMain where ItemId ='" + req.query.id +
        "' UNION " + "select packagessub.packageSubId as AssignId, Packages.packageName as VendorName,'packages' as tabname from packagessub inner join Packages on Packages.packageId = packagessub.packageId where itemId ='" + req.query.id + "' ";
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




    try {
        // const pool = await poolPromise;
        // 
        // // 
        // let query = "Delete from AssignItemVendor where ItemId='" + req.query.id + "'";
        // let query2 = "Delete from StoreItems where Id='" + req.query.id + "'";


        // Delete from Assigned Store Items Table //

        // try {
        //     const recordset = await pool.request().query(query);
        //     if (recordset) {
        //         
        //         res.send(recordset.recordset);
        //     } else {
        //         res.send([]);
        //     }
        // } catch (queryErr) {
        //     res.status(406).send("Something went wrong  " + queryErr);
        //     return;
        // }

        //                                       //




        // Delete from Store Items Table //

        // try {
        //     const recordset = await pool.request().query(query2);
        //     if (recordset) {
        //         
        //         res.send(recordset.recordset);
        //     } else {
        //         res.send([]);
        //     }
        // } catch (queryErr) {
        //     res.status(406).send("Something went wrong  " + queryErr);
        //     return;
        // }

        //                                       //





    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});
router.get('/deleteStoreItem', middleware.checkToken, async (req, res) => {
    
    // Check if exist in other tables as foreign keys //
    const pool = await poolPromise;
    // let query = "SELECT COUNT(ItemId) as AssignItemVendor_items  from AssignItemVendor where ItemId='" + req.query.id + "' UNION SELECT COUNT(itemId) as packagessub_items FROM packagessub where itemId='" + req.query.id + "' UNION SELECT COUNT(ItemId) as PurchasedOrderSub_items FROM PurchasedOrderSub where ItemId='" + req.query.id + "' ";
    let query = "delete from StoreItems where Id='" + req.query.id + "' ";
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
    try {

    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});
router.get('/deleteAllAssignItem', middleware.checkToken, async (req, res) => {
    
    // Check if exist in other tables as foreign keys //
    const pool = await poolPromise;
    // let query = "SELECT COUNT(ItemId) as AssignItemVendor_items  from AssignItemVendor where ItemId='" + req.query.id + "' UNION SELECT COUNT(itemId) as packagessub_items FROM packagessub where itemId='" + req.query.id + "' UNION SELECT COUNT(ItemId) as PurchasedOrderSub_items FROM PurchasedOrderSub where ItemId='" + req.query.id + "' ";
    let query = "Delete from AssignItemVendor where AssignId='" + req.query.id + "' ";
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
    try {

    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});
router.get('/deleteAllPackages', middleware.checkToken, async (req, res) => {
    
    // Check if exist in other tables as foreign keys //
    const pool = await poolPromise;
    // let query = "SELECT COUNT(ItemId) as AssignItemVendor_items  from AssignItemVendor where ItemId='" + req.query.id + "' UNION SELECT COUNT(itemId) as packagessub_items FROM packagessub where itemId='" + req.query.id + "' UNION SELECT COUNT(ItemId) as PurchasedOrderSub_items FROM PurchasedOrderSub where ItemId='" + req.query.id + "' ";
    let query = "Delete from packagessub where packageSubId='" + req.query.id + "' ";
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
    try {

    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});
router.get('/deleteAllPurchaseOrder', middleware.checkToken, async (req, res) => {
    
    // Check if exist in other tables as foreign keys //
    const pool = await poolPromise;
    // let query = "SELECT COUNT(ItemId) as AssignItemVendor_items  from AssignItemVendor where ItemId='" + req.query.id + "' UNION SELECT COUNT(itemId) as packagessub_items FROM packagessub where itemId='" + req.query.id + "' UNION SELECT COUNT(ItemId) as PurchasedOrderSub_items FROM PurchasedOrderSub where ItemId='" + req.query.id + "' ";
    let query = "Delete from PurchasedOrderSub where Poidsub='" + req.query.id + "' ";
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
    try {

    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});



router.get('/getAllVendorsByStoreItemId', middleware.checkToken, async (req, res) => {
    

    // Check if exist in other tables as foreign keys //
    const pool = await poolPromise;
    // let query = "SELECT COUNT(ItemId) as AssignItemVendor_items  from AssignItemVendor where ItemId='" + req.query.id + "' UNION SELECT COUNT(itemId) as packagessub_items FROM packagessub where itemId='" + req.query.id + "' UNION SELECT COUNT(ItemId) as PurchasedOrderSub_items FROM PurchasedOrderSub where ItemId='" + req.query.id + "' ";
    let query = "SELECT * FROM AssignItemVendor INNER JOIN StoreItems ON AssignItemVendor.ItemId = StoreItems.Id INNER JOIN " +
        " VendorDetails ON AssignItemVendor.VendorId = VendorDetails.VendorId WHERE AssignItemVendor.ItemId = '" + req.query.id + "' ";
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

});

module.exports = router;



// SELECT * FROM AssignItemVendor INNER JOIN StoreItems ON AssignItemVendor.ItemId = StoreItems.Id INNER JOIN
// VendorDetails ON AssignItemVendor.VendorId = VendorDetails.VendorId WHERE AssignItemVendor.ItemId = '3'