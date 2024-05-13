//#region Declaration

let express = require('express');
let router = express.Router();
let format = require('date-fns/format');
let middleware = require('../middleware');
const { poolPromise } = require('../database/db');
const { sql } = require('../database/db');
//#endregion
/**
 * ASSIGN A SPECIFIC EMPLOYEE TO A SPECIFIC DEPARTMENT , ASSIGN SHIFT (HISTORY)
 */

router.post('/add', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "insert into dbo.EmployeeDepartment ([DepartmentId],[ShiftId],[StartDate],[EndDate],[CreatedDate],[ModifiedDate],[Employeeid],[IsArchive])  values('" +
        +req.body.DepartmentId + "','" + req.body.ShiftId + "','" + req.body.StartDate + "','" +
        req.body.EndDate + "','" + format(new Date, 'MM/dd/yyyy H:mm:ss') + "', null ,'" + req.body.Employeeid +
        "'" + ", 'false' )";
        
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
router.get('/delete', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "Delete from EmployeeDepartment where";
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
/**
 * DEACTIVATE ASSIGNMENT-->ASSIGN A SPECIFIC EMPLOYEE TO A SPECIFIC DEPARTMENT , ASSIGN SHIFT (HISTORY)
 */

router.get('/delete', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        try {
            const recordset = await pool.request().input('tablename', sql.Text, 'EmployeeDepartment')
                .input('Rowid', sql.Int, req.query.id)
                .input('Userid', sql.Int, req.query.userid)  /// hardcoded for testing replace with logged in user id
                .input('TblPKName', sql.Text, 'id')
                .execute('AuditRecord');
            res.send(recordset.recordset);
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
/**
* Get all assignments
*/
router.get('/getAll', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "SELECT      d.id, d.DepartmentId, Department.DeptName as DeptName," +
        " d.ShiftId , CONVERT(varchar, d.StartDate, 107) AS StartDate, " +
        " CONVERT(varchar, d.EndDate, 107) AS EndDate, CONVERT(varchar, d.CreatedDate, 0) AS CreatedDate, " +
        " CONVERT(varchar, d.ModifiedDate, 0) " +
        " AS ModifiedDate, d.Employeeid, d.IsArchive, e.FirstName + ' ' + e.LastName AS EmployeeName, g.Name as ShiftName " +
        " FROM            EmployeeDepartment AS d INNER JOIN " +
        " Employee AS e ON d.Employeeid = e.EmployeeId INNER JOIN " +
        " [dbo].[Shift] AS g ON d.ShiftId  = g.ShiftID  INNER JOIN " +
        " Department ON d.DepartmentId = Department.DepartmentId and (Department.IsArchive = 'false')  " +
        " WHERE        (d.IsArchive = 'false') and (e.IsArchive = 'false') ORDER BY id DESC";
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

/**
 * GET Assignment by id
 */

 router.get('/getById', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query ="SELECT d.[id],d.[DepartmentId],d.[ShiftId]" +
        ", convert(varchar,d.[StartDate], 23) as StartDate" +
        ", convert(varchar,d.[EndDate], 23)  as EndDate" +
        ", convert(varchar,d.[CreatedDate], 107) as CreatedDate" +
        ", convert(varchar,d.[ModifiedDate], 107) as ModifiedDate" +
        ",d.[Employeeid],d.[IsArchive], e.FirstName + e.LastName as Employee, s.StartTime,s.EndTime , s.Name " +
        " FROM [dbo].[EmployeeDepartment] as d, Employee as e, [Shift] as s where d.Employeeid= e.EmployeeId and  d.ShiftId= s.ShiftID and d.IsArchive='false'" +
        "and id='" + req.query.id + "'";
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

/**
 * update specific assignment emp-dept-shift-assignUpdate
 */
 router.post('/update', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "update [dbo].[EmployeeDepartment] set [DepartmentId]= '" + req.body.DepartmentId + "' ," +
        "[ShiftId ]='" + req.body.ShiftId + "' ," + "[StartDate]='" + req.body.StartDate + "'," + "[EndDate]='" + req.body.EndDate + "'," + "[ModifiedDate]='" + format(new Date, 'MM/dd/yyyy H:mm:ss') + "', [Employeeid]='" + req.body.Employeeid + "'" +
        " where id =" + req.body.id + " and IsArchive = 'false'";
        
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

module.exports = router;