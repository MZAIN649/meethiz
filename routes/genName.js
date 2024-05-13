let express = require("express");
let router = express.Router();
var sql = require("mssql/msnodesqlv8");
var nodemailer = require("nodemailer");
var bodyParser = require("body-parser");
let middleware = require("../middleware");
let configg = require("../config");
const { poolPromise } = require("../database/db");
const { json } = require("body-parser");
const { compareSync } = require("bcrypt");

router.post("/CategoryPost", middleware.checkToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    
    let query =
      "insert into dbo.Generic_Name values ('" +
      req.body.GenericName +
      "','" +
      req.body.Category +
      "','" +
      req.body.GenericCode +
      "')";

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
    res.status(406);
    res.send(err.message);
  }
});

router.post("/Update", middleware.checkToken, async (req, res) => {
  try {
    const pool = await poolPromise; 
    let query ="Update Generic_Name set Generic_Name= '" +
    req.body.GenericName +"',Cat_Id='"+req.body.Category+"',Gen_Code='"+req.body.GenericCode+"' Where Generic_Name_Id='"+req.body.GenericId+"'";
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
    res.status(406);
    res.send(err.message);
  }
});


router.get('/fetchId', middleware.checkToken, async (req, res) => {
  
  
  try {
      const pool = await poolPromise;
      let query = "Select * from dbo.Generic_Name Where Generic_Name_Id ='"+req.query.Id+"'";
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
router.get("/fetchAlljoin", middleware.checkToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    let query = "select * from Generic_Name";

    try {
      const recordset = await pool.request().query(query);
      if (recordset) {
        res.send(recordset.recordset);
      } else {
        res.send(false);
      }
    } catch (queryErr) {
      res.status(406).send("Something went wrong  " + queryErr);
      return;
    }
  } catch (err) {
    res.status(406);
    res.send(err.message);
  }
});

module.exports = router;
