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
router.post('/addvendor', async (req, res) => {
    try {
        const pool = await poolPromise;
        let duplicate_flag = 0;
        let duplicate_check_query = "SELECT * FROM VendorDetails where VendorName = '"+req.body.VendorName+"' AND ContactNum = '"+req.body.Contact+"'"
        
        try {
            const recordset = await pool.request().query(duplicate_check_query);
            
            
            duplicate_flag = recordset.recordset.length;
            // return;
            if (duplicate_flag > 0) {
                res.send({
                    duplicate: 'true'
                });
            } else {
                let query = "insert into VendorDetails ( VendorName,ContactPerson,ContactNum,Address,Email,AccountTitle,NTN,City) values( '" + req.body.VendorName + "','" + req.body.ContactPerson + "','" + req.body.Contact + "','" +
                req.body.Address + "' , '" + req.body.Email + "' , '" + req.body.AccountTitle + "' , '" + req.body.NTN + "' , '" + req.body.city + "'  )";
                
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
router.post('/assignitemtovendor', async (req, res) => {
    
    try {
        const pool = await poolPromise;
        let query = "INSERT INTO [AssignItemVendor] ([ItemId] ,[VendorId],[Status]) VALUES ( '" + req.body.ItemId + "','" + req.body.VendorId + "','" + req.body.Active + "' )";
        
        try {
            const recordset = await pool.request().query(query);
            
            if (recordset) {
                res.send(true);
            } else {
                res.send(err.message);
                
            }
        } catch (queryErr) {
            if (queryErr.number == 2601) {
                res.json("duplicate")
            } else {
                res.json("something went wrong"+queryErr);
            }
            return;
            //res.status(406).send("Something went wrong  " + queryErr);
            //return;
        }
    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});
router.get('/getallvendor', async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "select * ,City.Name as Cname from VendorDetails inner join City on City.Id = VendorDetails.City";
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
router.get('/getallvendorIdandName', async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "select VendorId ,VendorName  from VendorDetails ";
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

router.get('/deletevendorcheck', middleware.checkToken, async (req, res) => {
    

    // Check if exist in other tables as foreign keys //
    const pool = await poolPromise;
    // let query = "SELECT COUNT(ItemId) as AssignItemVendor_items  from AssignItemVendor where ItemId='" + req.query.id + "' UNION SELECT COUNT(itemId) as packages_sub_items FROM packagessub where itemId='" + req.query.id + "' UNION SELECT COUNT(ItemId) as PurchasedOrderSub_items FROM PurchasedOrderSub where ItemId='" + req.query.id + "' ";
    let query = "select AssignId, ItemName from AssignItemVendor INNER JOIN StoreItems ON AssignItemVendor.ItemId = StoreItems.Id where VendorId ='" + req.query.VendorId + "'";
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
router.get('/GetAssignedItemById', async (req, res) => {
    try {
        
        const pool = await poolPromise;
        try {
            let query = "Select ItemName, Id, ItemCode from StoreItems where id NOT IN (Select ItemId From AssignItemVendor where VendorId ='" + req.query.Id + "')";

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



router.post('/deletevendor', async (req, res) => {
    // 
    // 
    try {
        const pool = await poolPromise;
        try {
            
            const recordset = await pool.request()
                .input('userid', sql.Int, req.body.CurrentUserId)
                .input('VendorId', sql.Int, req.body.VendorId)
                .execute('DeleteVendor');
            
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




router.get('/getVendorDataById', async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "select * from VendorDetails INNER JOIN City ON VendorDetails.City = City.Id where VendorId='" + req.query.Id + "'";
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
router.post('/updatevendor', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let duplicate_flag = 0;
        let duplicate_check_query = "SELECT * FROM VendorDetails where VendorName = '"+req.body.VendorName+"' AND ContactNum = '"+req.body.Contact+"' AND VendorId != '"+req.body.VendorId+"'"
        
        try {
            const recordset = await pool.request().query(duplicate_check_query);
            
            
            duplicate_flag = recordset.recordset.length;
            // return;
            if (duplicate_flag > 0) {
                res.send({
                    duplicate: 'true'
                });
            } else {
                let query = "Update dbo.VendorDetails set VendorName= '" +
            req.body.VendorName + "', ContactPerson='" + req.body.ContactPerson + "', Email='" + req.body.Email + "', ContactNum='" + req.body.Contact + "', Address='" + req.body.Address + "' , AccountTitle='" + req.body.AccountTitle + "' , NTN='" 
            + req.body.NTN + "' , city='" + req.body.city + "' where VendorId= '" + req.body.VendorId + "'";
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
router.post('/EmailIdentifier', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let duplicate_flag = 0;
        let duplicate_check_query = "SELECT * FROM VendorDetails where Email = '"+req.body.Email+"'"
        
        try {
            const recordset = await pool.request().query(duplicate_check_query);
            
            
            duplicate_flag = recordset.recordset.length;
            // return;
            if (duplicate_flag > 0) {
                res.send({
                    duplicate: 'true'
                });
            } 
            else{
                res.send({
                    duplicate: 'false'
                });
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
router.post('/EmailIdentifierEdit', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let duplicate_flag = 0;
        let duplicate_check_query = "SELECT * FROM VendorDetails where Email = '"+req.body.Email+"'AND VendorId!='"+req.body.VendorId+"'"
        
        try {
            const recordset = await pool.request().query(duplicate_check_query);
            
            
            duplicate_flag = recordset.recordset.length;
            // return;
            if (duplicate_flag > 0) {
                res.send({
                    duplicate: 'true'
                });
            } 
            else{
                res.send({
                    duplicate: 'false'
                });
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
router.post('/AssignItem', async (req, res) => {
    try {
        const pool = await poolPromise;
        try {
            const recordset = await pool.request().input('VendorId', sql.Int, req.body.vendor)
                .input('recSubData', sql.Text, req.body.recSub)
                .execute('AssignItem');
            res.json(recordset.returnValue);
            
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

router.get('/deleteassigneditem', async (req, res) => {
    
    try {
        const pool = await poolPromise;
        
        
        let query = "Delete from AssignItemVendor where AssignId='" + req.query.AssignId + "'";
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
router.get('/GetAllUnassignedItem', async (req, res) => {
    try {

        const pool = await poolPromise;
        try {
            let query = "Select * FROM AssignItemVendor Inner Join StoreItems on ItemId = StoreItems.id where VendorId = '" + req.query.Id + "'";

            
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
router.get('/GetAllAssignedItem', async (req, res) => {
    try {
        
        const pool = await poolPromise;
        try {
            let query = "Select ItemName, Id, ItemCode from StoreItems where id NOT IN (Select ItemId From AssignItemVendor where VendorId ='" + req.query.Id + "')";

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


module.exports = router;