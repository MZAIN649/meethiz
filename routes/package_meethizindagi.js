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

// Update Purchased Order
router.post('/updatePurchasedOrder', middleware.checkToken, async (req, res) => {
    
    try {
        const pool = await poolPromise;
        try {
            const recordset = await pool.request().input('mainId', sql.Int, req.body.mainId)

                .input('EmployeeId', sql.Int, req.body.user)
                .input('VendorId', sql.Int, req.body.Vendor)
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


router.get('/getPackageStatusOfPatient', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query =" select p.PatientFirstName+' '+p.PatientLastName as patientName,pk.packageName,ps.Status as StatusId ,u.Userid,c.CategoryName as [Status],convert (varchar,ps.CreatedOn,113) as CreatedOn, ps.PackageStatusId,ps.RegNumber,ps.PackageId,u.Firstname+' '+u.Lastname as userName from PackagesStatus as ps " +
        "  inner join PatientInformation as p on  p.RegNumber = ps.RegNumber " +
        " inner join Packages as pk on pk.packageId =ps.PackageId " +
        " inner join [User] as u on u.Userid = ps.[CreatedBy] " +
        " inner join Categories as c on c.CategoryId =ps.Status " ;
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

router.post('/getSearchPackageStatusByDate', async (req, res) => {
    
    try {
        const pool = await poolPromise;
        let query =   " select p.PatientFirstName+' '+p.PatientLastName as patientName,pk.packageName,ps.Status as StatusId ,u.Userid,c.CategoryName as [Status],convert (varchar,ps.CreatedOn,113) as CreatedOn, ps.PackageStatusId,ps.RegNumber,ps.PackageId,u.Firstname+' '+u.Lastname as userName from PackagesStatus as ps " +
        " inner join PatientInformation as p on  p.RegNumber = ps.RegNumber 																																																										" +
        " inner join Packages as pk on pk.packageId =ps.PackageId 																																																												" +
        " inner join [User] as u on u.Userid = ps.[CreatedBy] 																																																													" +
        " inner join Categories as c on c.CategoryId =ps.Status 																																																													" +
        " WHERE (ps.ReturnDamageDate BETWEEN '" + req.body.startDate + "' AND '" + req.body.endDate + "') order by ps.CreatedOn desc "
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
router.post('/postPackageStatusOfPatient', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query =  "UPDATE  PackagesStatus set createdBy='" + req.body.UserId + "',Status='" + req.body.StatusId + "',ReturnDamageDate='" + req.body.Date + "',Comments='" + req.body.Comments + "' where PackageStatusId='" + req.body.PackageStatusId + "'"; 
        try {
            const recordset = await pool.request().query(query);
            if (recordset) {
                res.send([true]);
            } else {
                res.send([false]);
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


router.post('/addPackage', middleware.checkToken, async (req, res) => {
    
    try {
        const pool = await poolPromise;
        let query = "insert into Packages (packageName,createdBy) values('" + req.body.PackageName + "','" + req.body.user + "')";
        try {
            const recordset = await pool.request().query(query);
            
            if (recordset) {
                res.send([true]);
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
router.get('/DeleteByassignedPackageId', middleware.checkToken, async (req, res) => {
    
    try {
        const pool = await poolPromise;
        let query = "Delete from AssignedPackages where assignedPackageId ='" + req.query.id + "' ";
        try {
            const recordset = await pool.request().query(query);
            
            if (recordset) {
                res.send([true]);
            } else {
                res.send([false]);
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
router.get('/DeletePackageName', middleware.checkToken, async (req, res) => {
    
    try {
        const pool = await poolPromise;
        let query = " begin Transaction " +
            " Delete from AssignedPackages where packageId ='" + req.query.id + "' " +
            " Delete from packagessub where packageId = '" + req.query.id + "' " +
            " Delete from Packages where packageId = '" + req.query.id + "' " +
            " commit Transaction  "
        try {
            const recordset = await pool.request().query(query);
            
            if (recordset) {
                res.send([true]);
            } else {
                res.send([false]);
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
router.get('/getPackages', middleware.checkToken, async (req, res) => {
    
    try {
        const pool = await poolPromise;
        let query = "select * from  Packages ";
        try {
            const recordset = await pool.request().query(query);
            
            if (recordset) {
                res.send(recordset.recordset);
            } else {
                res.send([0]);
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
router.get('/getPatientName', middleware.checkToken, async (req, res) => {
    
    try {
        const pool = await poolPromise;
        let query = "SELECT [RegNumber],[PatientFirstName],[PatientLastName],[RegStatus],[PoiNo] FROM [PatientInformation]  where RegStatus = 3 order by PatientFirstName asc";
        try {
            const recordset = await pool.request().query(query);
            
            if (recordset) {
                res.send(recordset.recordset);
            } else {
                res.send([0]);
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
// router.get('/getPackagesSelect', middleware.checkToken, async (req, res) => {
//     
//     try {
//         const pool = await poolPromise;
//         let query = "select * from  Packages where packageid not in ( select packageid from packagessub)";
//         try {
//             const recordset = await pool.request().query(query);
//             
//             if (recordset) {
//                 res.send(recordset.recordset);
//             } else {
//                 res.send([0]);
//             }
//         } catch (queryErr) {
//             res.status(406).send("Something went wrong  " + queryErr);
//             return;
//         }
//     } catch (err) {
//         res.status(406)
//         res.send(err.message)
//     }
// });

router.get('/deleteStoreItem', middleware.checkToken, async (req, res) => {

    
    let id = req.query.id;
    // return 0;
    try {
        const pool = await poolPromise;
        let query = "Delete from PurchasedOrderSub where Poidsub='" + req.query.id + "'";
        try {
            const recordset = await pool.request().query(query);
            if (recordset) {
                // try {
                //     let pool = await poolPromise;
                //     const update = "update PurchasedOrderMain set(SubTotal) value('"+req.body.sub_total+"') where   POIDMain  =   '" + req.body.mainId + "'";
                //     try {
                //         const recordset = await pool.request().query(update);
                //         if(recordset){
                //             res.send([true]);
                //         }
                //     } catch (error) {
                //         res.send([false])
                //     }


                // } catch (error) {

                // }
                res.send([true])

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
router.get('/getStoreItemsFromCategory', middleware.checkToken, async (req, res) => {


    try {
        const pool = await poolPromise;
        let query = "select Item_Category.Cat_Name as CatName,StoreItems.ItemCode as ItemCode,StoreItems.ItemName as ItemName,StoreItems.Id as ItemId from Item_Category " +
            "  left join StoreItems on StoreItems.CatId=Item_Category.Cat_Id " +
            "  where Item_Category.Cat_Id =7";


        try {
            const recordset = await pool.request().query(query);
            if (recordset) {

                res.send(recordset.recordset)

            } else {
                res.send([query.error]);
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
router.get('/getReceivedStoreItem', middleware.checkToken, async (req, res) => {


    try {
        const pool = await poolPromise;
        let query = " select sub.ItemCode as ItemCode,sub.ItemQty as ItemQty ,StoreItems.ItemName as ItemName " +
            " from StoreItemReceivedSub as sub " +
            " inner join StoreItems on StoreItems.Id=sub.ItemCode ";
        try {
            const recordset = await pool.request().query(query);
            if (recordset) {

                res.send(recordset.recordset)

            } else {
                res.send([query.error]);
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
router.get('/getCreatedPackageById', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "  select Packages.packageName as packageName,packagessub.packageId as packageId,packagessub.packageId as packageId, " +
            " packagessub.packageSubId as packageSubId ,										 " +
            " packagessub.itemId as itemId,packagessub.quantity as qty,						 " +
            " StoreItems.ItemName as ItemName  from Packages								 " +
            " inner join packagessub on packagessub.packageId=Packages.packageId 			 " +
            " inner join StoreItems on StoreItems.Id=packagessub.itemId						 " +
            " where packagessub.packageId='" + req.query.id + "'";
        try {
            const recordset = await pool.request().query(query);
            if (recordset) {

                res.send(recordset.recordset)

            } else {
                res.send([query.error]);
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
router.get('/checkCreatedPackageById', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
 
        let query = " select sum(ItemQty) as ItemQty ,StoreItems.ItemName as ItemName  from StoreItemReceivedSub " +
            " inner join StoreItems on StoreItems.Id=StoreItemReceivedSub.ItemCode " +
            " where StoreItemReceivedSub.ItemCode ='" + req.query.id + "'" +
            " group By StoreItems.ItemName ";
        try {
            const recordset = await pool.request().query(query);
            if (recordset) {

                res.send(recordset.recordset)

            } else {
                res.send([query.error]);
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
router.get('/getPackageByIdItems', middleware.checkToken, async (req, res) => {


    try {
        const pool = await poolPromise;
        let query = "select  st.ItemName as itemName,ps.quantity as qty  from Packages P "+
        "inner join packagessub ps on ps.packageId=p.packageId "+
        "inner join StoreItems st on st.Id=ps.itemId"+
        "where p.packageId=" + req.query.id + " ";
        try {
            const recordset = await pool.request()
                .execute('ShowPackages');
            
            if (recordset) {

                res.send(recordset.recordset)

            } else {
                res.send([query.error]);
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
router.get('/getCreatedPackages', middleware.checkToken, async (req, res) => {


    try {
        const pool = await poolPromise;
        let query = " select  P.packageName,P.packageId ,P.createdBy ,CONVERT(varchar,P.createdOn,106) as createdDate  from Packages P " +
            " where (select count(*) from packagessub where RegNumber = p.RegNumber)>0 ";
        try {
            const recordset = await pool.request()
                .execute('ShowPackages');
            
            if (recordset) {

                res.send(recordset.recordset)

            } else {
                res.send([query.error]);
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

router.get('/getPackageById', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "SELECT * FROM Packages WHERE packageId ='" + req.query.id + "' "
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

router.post('/updatePackageName', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "UPDATE dbo.Packages set packageName= '" + req.body.PackageName + "', createdBy='" + req.body.UserId + "' WHERE packageId='" + req.body.packageId + "'";

        try {
            const recordset = await pool.request().query(query);
            if (recordset) {
                res.send(true);
            } else {
                res.send([]);
            }
        } catch (queryErr) {
            if (queryErr.number == 2601) {
                res.json({
                    duplicate: "Duplicate"
                });
            } else {
                res.status(406).send("Something went wrong  " + queryErr);
                return;
            }
        }
    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});


router.post('/updatePackage', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        try {
            
            const recordset = await pool.request().input('packageName', sql.Int, req.body.PackageName)
                .input('user', sql.Int, req.body.user)
                .input('recSubData', sql.Text, req.body.recSub)
                .execute('UpdatePackages');
            
            res.json(true);

        } catch (queryErr) {
            
            
            res.status(406).send("Something went wrong  " + queryErr);
        }
    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});
router.post('/SendOrder', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        try {
            
            const recordset = await pool.request().input('Method', sql.Int, req.body.dileveryMethod)
                .input('Contact', sql.VarChar, req.body.contact)
                .input('DiliveryStatus', sql.VarChar, req.body.status)
                .input('RegNumber', sql.Int, req.body.regnumber)
                .input('PostalAddress', sql.VarChar, req.body.postaladdress)
                .input('EmployeeId', sql.Int, req.body.createdby)
                .input('DileveryDate', sql.Date, req.body.diliverydate)
                .input('City', sql.Int, req.body.city)
                .input('PackageId', sql.Int, req.body.packageid)
                .input('recSubData', sql.Text, req.body.recSub)
                .execute('PackageDelivery');
           
            res.json(true);

        } catch (queryErr) {
            
            
            res.status(406).send("Something went wrong  " + queryErr);
        }
    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});
router.post('/createPackage', middleware.checkToken, async (req, res) => {
    try { 
        const pool = await poolPromise;
        try {
            const recordset = await pool.request().input('packageName', sql.Int, req.body.PackageName)
                .input('user', sql.Int, req.body.user)
                .input('recSubData', sql.Text, req.body.recSub)
                .execute('NewCreatePackage');
            
            res.json(true);

        } catch (queryErr) {
            
            res.status(406).send("Something went wrong  " + queryErr);
        }
    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});
router.get('/deleteItemFormPackage', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = " Delete from packagessub where packageSubId='" + req.query.packageid + "' and itemId= '" + req.query.itemid + "' ";
        try {
            const recordset = await pool.request().query(query);
            if (recordset) {

                res.send([true])

            } else {
                res.send([query.error]);
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
router.get('/getPatientsWithNoPackage', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "Select * from PatientInformation  WHERE RegStatus = '3' and  PatientInformation.RegNumber not in (select RegNumber from AssignedPackages)"
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
router.get('/getPatientsWithPackageEdit', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "Select * from PatientInformation  WHERE RegStatus = '3' "
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
router.get('/getAssigendPackagesById', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "Select * from AssignedPackages where assignedPackageId ='" + req.query.id + "' "
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
router.post('/updateAssignedPackage', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "Update AssignedPackages set regnumber = '" + req.body.PatientId + "',packageId='" + req.body.PackageId + "',createdBy='" + req.body.User + "' where assignedPackageId ='" + req.body.AssigendPackgaeId + "' "
        try {
            const recordset = await pool.request().query(query);
            if (recordset) {
                res.send([true]);
                
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
        let duplicate_check_query = "SELECT * FROM Packages WHERE packageName = '" + req.body.PackageName + "' ";
        
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
router.post('/duplicateCheckEntryById', async (req, res) => {
    try {
        const pool = await poolPromise;
        let duplicate_flag = 0;
        let duplicate_check_query = "  SELECT * FROM packagessub WHERE packageId = '" + req.body.PackageName + "' ";
        
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
router.get('/updateStoreItemQuantity', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "update StoreItemReceivedSub   set ItemQtyCurrent ='" + req.query.qty + "' where  "
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
router.post('/assignedPackageToPatient', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        
        try {
            const recordset = await pool.request().input('packageId', sql.Int, req.body.PackageId)
                .input('user', sql.Int, req.body.user)
                .input('patientId', sql.Int, req.body.PactientId)
                .input('status', sql.Int, req.body.status)
                .execute('AssignedPackageToPatient');
            res.json([true]);

        } catch (queryErr) {
            
            res.status(406).send("Something went wrong  " + queryErr);
        }
    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});
router.post('/searchByPackageId&RegNumber', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "  select * from  Dbo.AssignedPackages where  packageStatus = '" + 1 + "'  and   regnumber = '" + req.body.PactientId + "'"
        try {
            const recordset = await pool.request().query(query);
            
            if (recordset.recordset.length > 0) {
                

                let update = " Update AssignedPackages set packageStatus = 0 ," +
                    " createdBy='" + req.body.user + "' " +
                    " where packageStatus = 1  and regnumber= '" + req.body.PactientId + "'  "
                try {
                    
                    const recordset = await pool.request().query(update);
                    
                    

                    if (recordset) {

                        res.send([true])

                    } else {
                        res.send([false])
                    }
                } catch (error) {
                    

                }



            } else {
                return res.send([query.error]);

            }

        } catch (queryErr) {
            res.status(406).send("Something went wrong  " + queryErr);
        }

    } catch (err) {
        res.status(406).send("Something went wrong  " + queryErr);

    }
});

router.get('/getAssigendPackages', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = " select  ap.packageStatus,u.Firstname as Firstname  , u.Lastname as Lastname ,PatientInformation.PoiNo as PoiNo,PatientInformation.PatientFirstName as PatientFirstName ,PatientInformation.PatientLastName as PatientLastName ,Packages.packageName as packageName ,ap.assignedPackageId  as assignedPackageId from AssignedPackages as ap " +
            "   inner join  Packages on Packages.packageId = ap.packageId " +
            "   inner join  PatientInformation on PatientInformation.RegNumber = ap.regnumber  " +
            "   inner join  dbo.[User]  as u on u.Userid = ap.createdBy where ap.packageStatus =1 ORDER BY ap.assignedPackageId DESC ";
        try {
            const recordset = await pool.request().query(query);
            if (recordset) {

                res.send(recordset.recordset)

            } else {
                res.send([query.error]);
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
router.post('/updateRegstatus&Comment', async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "UPDATE PackageStatus SET RegStatus ='" + req.query.statusid + "' ,Comments ='" + req.query.comments + "'  WHERE RegNumber ='" + req.query.id + "'";
        
        try {
            const recordset = await pool.request().query(query);
            if (recordset) {
                res.send(true);


            } else {
                res.send(false);
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


module.exports = router;