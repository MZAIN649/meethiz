//#region Declaration
let express = require('express');
let router = express.Router();
let format = require('date-fns/format');
let middleware = require('../middleware');
const { poolPromise } = require('../database/db');
const { sql } = require('../database/db');
let { executeDuplicateQuery, executeSelectQuery } = require('./utills/functions');
//#endregion

// REGISTER EMPLOYEE
/*** make Email Unique (imp)*/
router.post('/register', middleware.checkToken, async (req, res) => {
    let query = "insert into Employee  ([FirstName],[LastName],[Phone],[Email],[Cnic],[Address],[Designation],[JoiningDate],[BirthDate],[MaritalStatus],[Gender],[CreatedDate],[LastModifiedDate],[IsArchive]) values('" + req.body.FirstName + "','" +
        req.body.LastName + "','" + req.body.Phone + "','" + req.body.Email + "','" +
        req.body.Cnic + "','" + req.body.Address + "','" + req.body.Designation + "','" +
        req.body.JoiningDate + "','" + req.body.BirthDate + "','" + req.body.MaritalStatus + "','" +
        req.body.Gender + "','" + format(new Date, 'MM/dd/yyyy H:mm:ss') + "'," + null + ",'false')";
    executeDuplicateQuery(query).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });
});
// SELECT EMPLOYEE   (RETURN ALL ACTIVE EMPLOYEES) 
router.get('/getAllEmployee', middleware.checkToken, async (req, res) => {
    let query = "SELECT EmployeeId,(FirstName+ ' '+LastName) as FullName,Phone,Email,Cnic,Address,Designation,  " +
        " convert(varchar, JoiningDate, 107) as JoiningDate , convert(varchar, BirthDate, 0) as BirthDate,  " +
        " MaritalStatus,Gender, convert(varchar, CreatedDate, 0) as CreatedDate,  " +
        " convert(varchar, LastModifiedDate, 0) as LastModifiedDate, Employee.IsArchive , " +
        "  c1.CategoryName as DesignationName, c2.CategoryName as MaritalStatusName,c3.CategoryName as GenderName " +
        "  FROM Employee " +
        "  INNER JOIN Categories c1 ON Employee.Designation= c1.CategoryId " +
        "  INNER JOIN Categories c2 ON Employee.MaritalStatus= c2.CategoryId " +
        " INNER JOIN Categories c3 ON Employee.Gender= c3.CategoryId 		" +
        " where Employee.IsArchive='false' ORDER BY EmployeeId ASC ";
    executeSelectQuery(query).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });
});

// SELECT EMPLOYEE which have no department   (RETURN ALL ACTIVE EMPLOYEES) 
router.get('/getAllEmployeesWithoutDepartment', middleware.checkToken, async (req, res) => {
    let query = "select EmployeeId,(FirstName+ ' '+LastName) as FullName,Designation from Employee where EmployeeId not in (select Employeeid from EmployeeDepartment)";
    executeSelectQuery(query).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });
});

//GET EMPLOYEE BY ID 
router.get('/getEmployeeById', middleware.checkToken, async (req, res) => {
    let query = "SELECT EmployeeId,FirstName,LastName,Phone,Email,Cnic,Address,Designation, " +
        " convert(varchar, JoiningDate, 23) as JoiningDate , convert(varchar, BirthDate, 23) as BirthDate, " +
        " MaritalStatus,Gender, convert(varchar, CreatedDate, 0) as CreatedDate, convert(varchar, LastModifiedDate, 0) as " +
        " LastModifiedDate,IsArchive FROM Employee where IsArchive='false' and EmployeeId='" + req.query.EmployeeId + "'";
    try {
        const pool = await poolPromise;
        try {
            const recordset = await pool.request().query(query);
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
// UPDATE EMPLOYEE    
router.post('/updateEmployee', middleware.checkToken, async (req, res) => {
    let query = "update Employee  set FirstName= '" + req.body.FirstName + "'," +
        "  LastName  ='" + req.body.LastName + "'," +
        "  Phone  ='" + req.body.Phone + "'," +
        "  Email  ='" + req.body.Email + "'," +
        "  Cnic  ='" + req.body.Cnic + "'," +
        "  Address  ='" + req.body.Address + "'," +
        "  Designation  = " + req.body.Designation + "," +
        "  JoiningDate  ='" + req.body.JoiningDate + "'," +
        "  BirthDate  ='" + req.body.BirthDate + "'," +
        "  MaritalStatus  ='" + req.body.MaritalStatus + "'," +
        "  LastModifiedDate  ='" + format(new Date, 'MM/dd/yyyy H:mm:ss') + "'," +
        "  Gender  = '" + req.body.Gender + "'" + " where IsArchive='false' and EmployeeId= '" + req.body.EmployeeId + "'";
    executeDuplicateQuery(query).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });
});
//SEARCH EMPLOYEE BY NAME
router.get('/searchEmployee', middleware.checkToken, async (req, res) => {

    let query = "SELECT EmployeeId" + ",FirstName,LastName,Phone,Email,Cnic,Address,Designation" +
        ",convert(varchar, JoiningDate, 0) as JoiningDate " +
        ", convert(varchar, BirthDate, 0) as BirthDate" +
        ",MaritalStatus,Gender, convert(varchar, CreatedDate, 0) as CreatedDate, convert(varchar, LastModifiedDate, 0) as LastModifiedDate,IsArchive" +
        " FROM Employee where IsArchive='false' and (Firstname='" + req.query.name + "' or LastName='" + req.query.name + "' )";
    executeSelectQuery(query).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });
});

router.get('/deleteEmployeeById', middleware.checkToken, async (req, res) => {

    try {
        const pool = await poolPromise;
        let query = " begin transaction " +
        "delete EmployeeDepartment where Employeeid='"+req.query.EmployeeId+"' " +
        "delete Employee where EmployeeId='"+req.query.EmployeeId+"' " +
        "commit transaction ";
        
        try {
            const recordset = await pool.request().query(query);
            if (recordset) {
                res.send([true]);
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
router.get('/deleteEmployee', middleware.checkToken, async (req, res) => {

    let topquery = "select (select count (*) from EmployeeDepartment where Employeeid='" + req.query.EmployeeId + "') as empdep_count,(select count (*) from MachineWorkStatus where OperatorId ='" + req.query.EmployeeId + "') as mws_count";
    try {
        const pool = await poolPromise;
        try {
            const recordset = await pool.request().query(topquery);

            if (recordset.recordset[0].empdep_count > 0 || recordset.recordset[0].mws_count > 0) {
                if (recordset.recordset[0].empdep_count > 0 && recordset.recordset[0].mws_count > 0) {
                    //res.json('Employee has records'+recordset.recordset[0].empdep_count+'machine work has record'+recordset.recordset[0].mws_count);
                    res.json('Please First Remove Employee\'s Entries From EmployeeDepartment ( ' + recordset.recordset[0].empdep_count + ' ) & MachineWorkStatus ( ' + recordset.recordset[0].mws_count + ' )');
                }
                else if (recordset.recordset[0].mws_count > 0) {
                    res.json('Please First Remove Employee\'s Entries From MachineWorkStatus ( ' + recordset.recordset[0].mws_count + ' )');
                }
                else if (recordset.recordset[0].empdep_count > 0) {
                    res.json('Please First Remove Employee\'s Entries From EmployeeDepartment ( ' + recordset.recordset[0].empdep_count + ' )');
                }
                //  
            } else {
                let recordset = await pool.request().input('tablename', sql.Text, 'Employee')
                    .input('Rowid', sql.Int, req.query.EmployeeId)
                    .input('Userid', sql.Int, req.query.userid)  /// hardcoded for testing replace with logged in user id
                    .input('TblPKName', sql.Text, 'EmployeeId')
                    .execute('AuditRecord');
                res.send(recordset.recordset);
            }
        }
        catch (queryErr) {
            
            res.status(406).send("Something went wrong  " + queryErr);
        }
    }
    catch (err) {
        res.status(406)
        res.send(err.message)
    }

});
//GET ALL EMPLOYEES WHO's  DESIGNATION is SUPERVISOR
router.get('/getAllEmployeeSupervisor', middleware.checkToken, async (req, res) => {
    let query = "SELECT EmployeeId,(FirstName+ ' '+LastName) as FullName,Phone,Email,Cnic,Address,Designation, " +
        " convert(varchar, JoiningDate, 107) as JoiningDate , convert(varchar, BirthDate, 0) as BirthDate, " +
        " MaritalStatus,Gender, convert(varchar, CreatedDate, 0) as CreatedDate, " +
        "  convert(varchar, LastModifiedDate, 0) as LastModifiedDate,IsArchive " +
        "  FROM Employee where IsArchive='false' and Designation=15";
    executeSelectQuery(query).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });
});
// GET getAllemployeesWithoutToken
router.get('/getAllemployeesWithoutToken', async (req, res) => {
    let query = "SELECT EmployeeId,(FirstName+' '+LastName) as FullName,Phone,Email,Cnic,Address,Designation, " +
        " convert(varchar, JoiningDate, 107) as JoiningDate , convert(varchar, BirthDate, 0) as BirthDate, " +
        " MaritalStatus,Gender, convert(varchar, CreatedDate, 0) as CreatedDate, " +
        "  convert(varchar, LastModifiedDate, 0) as LastModifiedDate,IsArchive " +
        "  FROM Employee where IsArchive='false'";
    executeSelectQuery(query).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });
});
//get Employee based on department

router.get('/getAllEmployeeByDepartment', middleware.checkToken, async (req, res) => {

    let query = `select e.EmployeeId, e.FirstName+' '+e.LastName as FullName , e.Designation
    from EmployeeDepartment ed, Employee e , Department d
    where
    ed.Employeeid = e.EmployeeId and ed.DepartmentId=d.DepartmentId
    and ed.DepartmentId ='${req.query.DepartmentId}' and e.isArchive='0'`;
    executeSelectQuery(query).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });
});

router.get('/getAllEmployeeByDepartmentGroup', middleware.checkToken, async (req, res) => {
    let q = `select e.FirstName+' '+e.LastName as FullName , e.Designation , c.CategoryName as groupName
        from EmployeeDepartment ed, Employee e , Department d , EmployeeGroup eg  , Categories c
        where
        ed.Employeeid = e.EmployeeId and ed.DepartmentId=d.DepartmentId
        and eg.EmployeeId= e.EmployeeId and ed.DepartmentId ='${req.query.DepartmentId}'
        and eg.GroupId='${req.query.GroupId}' and eg.IsArchive='0'
        and eg.GroupId=c.CategoryId `;
    executeSelectQuery(q).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });
});

/**get list of all the employees which are not assigned to any department */
router.get('/getAllEmployeesNotAssignedToDep', middleware.checkToken, async (req, res) => {
    let q = `select EmployeeId,(FirstName+' '+LastName) as FullName from Employee where 
    Employeeid not in ( select EmployeeId from EmployeeDepartment)`;
    executeSelectQuery(q).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });
});

/**for edit employee Department  */
/**get list of all the employees which are not assigned to any department */
router.get('/getAllEmployeesNotAssignedToDep_Edit', middleware.checkToken, async (req, res) => {
    let q = `select EmployeeId,(FirstName+' '+LastName) as FullName from Employee where 
    Employeeid not in ( select EmployeeId from EmployeeDepartment)
    union 
    select Employee.EmployeeId,(Employee.FirstName+' '+Employee.LastName) as FullName from EmployeeDepartment inner join Employee on  
    Employee.EmployeeId=EmployeeDepartment.EmployeeId and EmployeeDepartment.id=${req.query.id}`;
    executeSelectQuery(q).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });
});

module.exports = router;
