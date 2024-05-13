//#region 
let express = require('express');
let router = express.Router();
var sql = require('mssql/msnodesqlv8');
var nodemailer = require('nodemailer');
var bodyParser = require('body-parser');
let middleware = require('../middleware');
const { poolPromise } = require('../database/db');
const { json } = require('body-parser');

router.get('/gettotalregstatus', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "select 'totalhospital' as counts ,count(*) as total from hospital "+
        " union  select 'pendingdoctor' as counts ,count(*) as total from DoctorDetails where isArchive=0 "+
        " union  select 'activedoctor' as counts ,count(*) as total from DoctorDetails where isArchive=1 "+
        " union  select 'totalchildren' as counts ,count(*) as total from PatientInformation "+
        " union  select 'activechildren' as counts ,count(*) as total from PatientInformation where RegStatus=3"+
        " union  select 'pendingchildren' as counts ,count(*) as total from PatientInformation where RegStatus=2 " +
        " union  select 'prependingchildren' as counts ,count(*) as total from PatientInformation where RegStatus=1";
    
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
router.post("/EOQModel", middleware.checkToken, async (req, res) => {
    try {
      const pool = await poolPromise;
      try {
          const recordset = await pool.request().input('ItemCode', sql.Int, req.body.ItemCode)
              .execute('EOQMode');
              console.log(recordset)
          res.json(recordset.returnValue);

      } catch (queryErr) {
          
          res.status(406).send("Something went wrong  " + queryErr);
      }
  } catch (err) {
      res.status(406)
      res.send(err.message)
  }
  });
router.get('/currentStock', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = `SELECT  r.ItemName AS Item, r.ItemsReceived AS [Received], 
        ISNULL(s.itemsSent, 0) AS [Issued], r.ItemsReceived - ISNULL(s.itemsSent, 0) AS Stock,
        CASE WHEN (r.ItemsReceived - ISNULL(s.itemsSent, 0)) 
        <= StoreItems.MinAlertQty THEN 1 ELSE 0 END AS Alert
        FROM            (SELECT        SUM(StoreItemReceivedSub.ItemQty) AS ItemsReceived, StoreItems.ItemName,
        StoreItemReceivedSub.ItemCode AS itemcode
        FROM            StoreItemReceivedSub INNER JOIN
        StoreItems ON StoreItems.Id = StoreItemReceivedSub.ItemCode
        GROUP BY StoreItems.ItemName, StoreItemReceivedSub.ItemCode) AS r LEFT OUTER JOIN
        (SELECT        StoreItems.ItemName, StoreItems.id, SUM(StoreItemIssueSub.ItemQty) AS itemsSent
        FROM            StoreItems INNER JOIN StoreItemIssueSub ON StoreItems.Id = StoreItemIssueSub.ItemId
        GROUP BY StoreItems.ItemName, StoreItems.id) AS s ON r.itemcode = s.id INNER JOIN
        StoreItems ON r.itemcode = StoreItems.Id`;
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

router.get('/getallChildrenCount', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "select count(*) as total,Province.Province from PatientInformation inner join city on "+
        " PatientInformation.city=City.Id inner join Province on City.provinceid=Province.id "+
        " group by  Province.Province";
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
router.get('/getallpackagesCount', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "select count(*) as total,Province.Province from PatientInformation inner join city on "+
        " PatientInformation.city=City.Id inner join Province on City.provinceid=Province.id "+
        " group by  Province.Province";
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
router.get('/getallHospitalsCount', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = `select ISNULL(total,0) as total ,Province from (select count(*) as total,Province.Id from Hospital inner join city on 
        Hospital.HospitalCity=City.Id inner join Province on City.provinceid=Province.id 
        group by  Province.Id) p right join Province on p.id = Province.id`
       
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
router.get('/getallDoctorsCount', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = `select isnull(total,0) as total, Province from (select count(*) as total,Province.id from DoctorDetails inner join city on 
        DoctorDetails.city=City.Id inner join Province on City.provinceid=Province.id 
        group by  Province.id) p right join Province on p.id = Province.id`

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
router.get('/sidebarData', async (req, res) => {
        try {
            
        const pool = await poolPromise;
        let query =" SELECT  Rights.RightName as pagename, Rights.RightURL as link, Rights.MainHeading  as MainHeading, Rights.Icon as icon,UserAssignedRights.RightId AS RightId, UserAssignedRights.UserId AS userId"+
       " FROM UserAssignedRights INNER JOIN " +
       " Rights ON UserAssignedRights.RightId = Rights.RightId WHERE UserAssignedRights.UserId ="+req.query.id+" and (Rights.MainHeading is not NULL and "+
       " Rights.MainHeading <>'' and Rights.SidebarPage=1) Order by MainHeading asc"
 

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
//#endregion
module.exports = router;