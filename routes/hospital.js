//#region  Declaration
let express = require('express');
let router = express.Router();
let format = require('date-fns/format');
let middleware = require('../middleware');
const {
    poolPromise
} = require('../database/db');
const {
    sql
} = require('../database/db');
//#endregion


router.post('/addHospital', middleware.checkToken, async (req, res) => {
    try {

        const pool = await poolPromise;
        let query = "INSERT INTO [dbo].[Hospital]([HospitalName],[HospitalDescription],[HospitalCity],"+
            "[HospitalBeds],[HospitalContact],[HospitalEmail],[HospitalAddress], [IsArchive]) VALUES (" +
       "'"+ req.body.HospitalName + "','" + req.body.HospitalDescription + "','" +
        req.body.HospitalCity + "','" + req.body.HospitalBeds + "','" +
        req.body.HospitalContact + "','" + req.body.HospitalEmail + "','" + 
        req.body.HospitalAddress + "',0)";
     
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
// GET ALL Hospitals  
router.get('/getAllHospitals', middleware.checkToken, async (req, res) => {
    
    try {
        const pool = await poolPromise;
        let query = `SELECT [HospitalId],[HospitalName],[HospitalDescription],[HospitalCity],[HospitalBeds],
        [HospitalContact] ,[HospitalEmail] ,[HospitalAddress],City.Name as City FROM 
         [dbo].[Hospital] inner join City on hospital.HospitalCity = City.Id
         Order by hospitalName Asc`;
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
router.get('/getAllHospitalsWithoutToken', async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = `SELECT [HospitalId],[HospitalName],[HospitalDescription],[HospitalCity],[HospitalBeds],
        [HospitalContact] ,[HospitalEmail] ,[HospitalAddress],City.Name as City FROM 
         [dbo].[Hospital] inner join City on hospital.HospitalCity = City.Id
         Order by hospitalName Asc`;
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

// UPDATE Hospital 

router.post('/updateHospital', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "update  dbo.Hospital set HospitalName= '" +
        req.body.HospitalName + 
        "', HospitalDescription='" + req.body.HospitalDescription + "',HospitalContact='" + req.body.HospitalContact +
        "', HospitalCity="  + req.body.HospitalCity + ", HospitalBeds=" + req.body.HospitalBeds +
        ", HospitalEmail='" + req.body.HospitalEmail + "',HospitalAddress='" + req.body.HospitalAddress +       
        "' where HospitalId ='" + req.body.HospitalId + "' and IsArchive = 'false'";
      
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

//GET Hospital BY ID 

router.get('/getHospitalById', middleware.checkToken, async (req, res) => {
    try {
        
        const pool = await poolPromise;
        let query = `SELECT [HospitalId],[HospitalName],[HospitalDescription],[HospitalCity],[HospitalBeds]
        ,[Longitude] ,[Latitude] ,[HospitalContact] ,[HospitalEmail] ,[HospitalAddress] FROM 
        [dbo].[Hospital] where HospitalId ='` + req.query.hospitalId + "'";
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

//DELETE Hospital

router.get('/deleteHospital', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "Delete from Hospital where HospitalId='" + req.query.hospitalid +"'";
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





//#endregion
module.exports = router;