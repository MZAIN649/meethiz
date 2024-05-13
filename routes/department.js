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

// ADD DEPARTMENTS


router.post('/addDept', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "insert into dbo.Department([DeptName],[ModifiedDate],[Description],[PhoneNumber],[Location],[IsArchive],[SuperDepartment]) values ('" +
        req.body.DeptName + "'," + null + ",'" + req.body.Description + "','" +
        req.body.PhoneNumber + "','" + req.body.Location + "'," + "'false'," +
        req.body.SuperDepartment + ")";
        
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
// GET ALL DEPARTMENTS  
router.get('/getAllDept', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "SELECT child.DepartmentId,child.DeptName,convert(varchar, child.ModifiedDate, 0) " +
        " Modified_Date,child.Description,child.PhoneNumber,child.Location,child.IsArchive, parent.DeptName  " +
        " as SuperDepartment , parent.DepartmentId as Parentid FROM Department child LEFT OUTER JOIN  " +
        "  Department parent ON parent.DepartmentId=child.SuperDepartment where child.IsArchive='false' ORDER BY DepartmentId DESC";
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

// UPDATE DEPARTMENTS 

router.post('/updateDept', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "update  dbo.Department set DeptName= '" +
        req.body.DeptName + "' , ModifiedDate='" + format(new Date, 'MM/dd/yyyy H:mm:ss') +
        "', Description='" + req.body.Description + "',PhoneNumber='" + req.body.PhoneNumber +
        "', Location=' " + req.body.Location + "', SuperDepartment=" + req.body.SuperDepartment +
        " where DepartmentId ='" + req.body.DepartmentId + "' and IsArchive = 'false'";
        
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

//GET DEPARTMENT BY ID 

router.get('/getDepartmentById', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "SELECT child.DepartmentId,child.DeptName,convert(varchar, child.ModifiedDate, 0) " +
        "  Modified_Date,child.Description,child.PhoneNumber,child.Location,child.IsArchive, parent.DeptName as " +
        "  SuperDepartment , parent.DepartmentId as ParentId  FROM Department child LEFT OUTER JOIN  Department " +
        "   parent ON parent.DepartmentId=child.SuperDepartment where child.IsArchive='false'  " +
        "   and child.DepartmentId='" + req.query.DepartmentId + "'";
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

//DELETE DEPARTMENTS

router.get('/deleteDept', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "Delete from EmployeeDepartment where DepartmentId=" + req.query.Departmentid;
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



module.exports = router;