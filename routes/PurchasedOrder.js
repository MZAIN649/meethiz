//#region declaration
let express = require('express');
let router = express.Router();
var sql = require('mssql/msnodesqlv8');
var nodemailer = require('nodemailer');
var bodyParser = require('body-parser');
let middleware = require('../middleware');
let configg = require('../config');
let jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
var fileExtension = require('file-extension');
const fs = require('fs');
const path = require('path');
let app = express();
const saltRounds = 10;
const {
    poolPromise
} = require('../database/db');
const {
    json
} = require('body-parser');

router.post('/AddOrder', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;

        try {
            
            const recordset = await pool.request().input('PurchasedOn', sql.Date, req.body.purDate)
                // .input('invoiceNo', sql.Int, req.body.invNo)
                .input('user', sql.Int, req.body.user)
                .input('city', sql.Int, req.body.city)
                .input('Remarks', sql.Text, req.body.Remarks)
                .input('vendor', sql.Int, req.body.Vendor)
                .input('recSubData', sql.Text, req.body.recSub)
                .execute('PurchasedOrder');
            res.json(recordset.returnValue);
            
        } catch (queryErr) {
            
            res.status(406).send("Something went wrong  " + queryErr);
        }
    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});

// Update Purchased Order
router.post('/updatePurchasedOrder', middleware.checkToken, async (req, res) => {
    
    try {
        const pool = await poolPromise;
        try {
            
            const recordset = await pool.request().input('mainId', sql.Int, req.body.mainId)

                .input('EmployeeId', sql.Int, req.body.user)
                .input('VendorId', sql.Int, req.body.Vendor)
                .input('Remarks', sql.Text, req.body.Remarks)
                .input('recSubData', sql.Text, req.body.recSub)
                .execute('UpdatePurchasedOrder');
            res.json(true);

        } catch (queryErr) {
            
            res.status(406).send("Something went wrong  " + queryErr);
        }
    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});


router.get('/orders', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query =`select distinct pom.POIDMain, pom.CreatedBy,VendorDetails.VendorName,convert(varchar,pom.PODate, 107)as PDate,pom.InvoiceNo as PurchaseOrder,
        (u.Firstname +' '+ u.Lastname) as fullname ,
		case when StoreMain.StoreItemReceivedMainID is not null then 1 else 0 end as StoreMainId			
        from PurchasedOrderMain pom 
        inner join VendorDetails on pom.VendorId=VendorDetails.VendorId 
        inner join [User] u on pom.CreatedBy= u.Userid 
		left join StoreItemReceivedMain StoreMain on StoreMain.PONumber=pom.InvoiceNo 
		order by PDate, VendorDetails.VendorName,pom.CreatedBy,pom.POIDMain,fullname,StoreMainId,PurchaseOrder desc `;
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

router.get('/PurchasedOrderIdData', middleware.checkToken, async (req, res) => {
    
    try {
        const pool = await poolPromise;
        let query = "select  pom.POIDMain, convert(varchar,pom.PODate,23) as PODate,pos.Poidsub, pom.CreatedBy, pom.SubTotal, pom.InvoiceNo PurchaseOrder, VendorDetails.VendorId,VendorDetails.VendorName,VendorDetails.Email,VendorDetails.Address,VendorDetails.ContactPerson,pos.Quantity,pos.TotalPrice,pos.description as Description, Categories.CategoryName as Unit,Categories.CategoryId as UnitId,StoreItems.Id as ItemId, StoreItems.ItemName, " +
            " (u.Firstname +' '+ u.Lastname) as fullname, Remarks " +
            " from PurchasedOrderMain pom " +
            " inner join VendorDetails on pom.VendorId=VendorDetails.VendorId " +
            " inner join PurchasedOrderSub pos on pom.POIDMain=pos.Poidmain " +
            " inner join [User] u on pom.CreatedBy= u.Userid " +
            " inner join StoreItems on pos.ItemId=StoreItems.Id " +
            " Left join Categories on pos.Unit = Categories.CategoryId WHERE pom.POIDMain='" + req.query.id + "'";
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

router.get('/AssignedVendorItems', middleware.checkToken, async (req, res) => {
    
    try {
        const pool = await poolPromise;
        let query = `select  Asg.VendorId,Asg.ItemId, StoreItems.ItemName from AssignItemVendor as Asg 
        inner join StoreItems on Asg.ItemId=StoreItems.Id` ;
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
router.get('/deleteStoreItem', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        const recordset = await pool.request().input('SubId', sql.Int, req.query.id)
            .execute('DeletUpdateStoreItem');
        res.json(true);
    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});

// This gets all the units made under itemUnits category, EntityTypeId = 5239
router.get('/GetAllUnits', middleware.checkToken, async (req, res) => {

    try {
        const pool = await poolPromise;
        let query = " select CategoryId,CategoryName from Categories where Categories.EntityTypeId =3239"
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
router.get('/ItemByVendorId', middleware.checkToken, async (req, res) => {

    try {
        const pool = await poolPromise;
        let query = " select  *   from AssignItemVendor  as vd inner join StoreItems on vd.ItemId=StoreItems.Id WHERE vd.VendorId='" + req.query.id + "'"
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
router.post('/deletepurchaseorder', async (req, res) => {
    try {
        const pool = await poolPromise;
        try {
            
            const recordset = await pool.request()
                .input('userid', sql.Int, req.body.user_id)
                .input('POIDMain', sql.Int, req.body.POIDMain)
                .input('PONumber', sql.Text, req.body.PONumber)
                .execute('deletepurchaseorder');
            
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
// router.get('/deletepurchaseorder', middleware.checkToken, async (req, res) => {
//     
//     try {
//         const pool = await poolPromise;
//         
        
//         let query = "Delete from PurchasedOrder where POIDMain='" + req.query.POIDMain +"'";
        
//         try {
//             const recordset = await pool.request().query(query);
//             if (recordset) {
//                 res.send(recordset.recordset);
//             }
//             else {
//                 res.send([]);
//             }
//         }
//         catch (queryErr) {
//             res.status(406).send("Something went wrong  " + queryErr);
//             return;
//         }
//     }
//     catch (err) {
//         res.status(406)
//         res.send(err.message)
//     }
// });
router.post('/duplicateCheckEntry', async (req, res) => {
    try {
        const pool = await poolPromise;
        let duplicate_flag = 0;
        let duplicate_check_query = " select * from PurchasedOrderMain where InvoiceNo  = '" + req.body.invNo + "' ";
        
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




module.exports = router;