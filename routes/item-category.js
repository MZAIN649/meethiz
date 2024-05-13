//#region 
let express = require('express');
let router = express.Router();
var sql = require('mssql/msnodesqlv8');
var nodemailer = require('nodemailer');
var bodyParser = require('body-parser');
let middleware = require('../middleware');
const { poolPromise } = require('../database/db');
const { json } = require('body-parser');
     router.post('/AddCategory', middleware.checkToken, async (req, res) => {
        try {
            const pool = await poolPromise;
             
            let query = "insert into dbo.Item_Category (Cat_Name,Description) values ('" +
          req.body.CategoryName + "','" + req.body.Description +"'); "
            
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
                if(queryErr.number==2601){
                    res.json({duplicate:"Duplicate"});
                }
                else{
                    res.status(406).send("Something went wrong  " + queryErr);
                    return;
                }
            }
        }
        catch (err) {
            res.status(406)
            res.send(err.message)
        }
    });

    router.get('/DeleteCategory', middleware.checkToken, async (req, res) => {
        try {
            const pool = await poolPromise;          
            let query = "Delete from dbo.Item_Category where Cat_Id='" + req.query.Cat_Id +"'";
            
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


    router.post('/UpdateCategory', middleware.checkToken, async (req, res) => {
        try {
            const pool = await poolPromise;
            let query = "Update dbo.Item_Category set Cat_Name= '" +
          req.body.CategoryName + "', Description='" + req.body.Description +"' where Cat_Id='"+req.body.Cat_Id+"'";
            
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
                if(queryErr.number==2601){
                    res.json({duplicate:"Duplicate"});
                }
                else{
                    res.status(406).send("Something went wrong  " + queryErr);
                    return;
                }
            }
        }
        catch (err) {
            res.status(406)
            res.send(err.message)
        }
    });
    router.get('/CategoryData', middleware.checkToken, async (req, res) => {
        try {
            const pool = await poolPromise;
            let query = `SELECT       distinct Item_Category.Cat_Id, Item_Category.Cat_Name, Item_Category.Description,
                                        (select count(*) from storeitems where catid = Cat_id) as itemcount
                                        FROM            Item_Category Left join
                                        StoreItems ON Item_Category.Cat_Id = StoreItems.CatId`;
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
    router.get('/getCategoryDataById', middleware.checkToken, async (req, res) => {
        try {
            const pool = await poolPromise;
            let query = "select * from Item_Category where Cat_Id='"+req.query.Cat_Id+"'";
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
    

module.exports=router;