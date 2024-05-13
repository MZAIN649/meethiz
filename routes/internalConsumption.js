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

router.get("/getEmployeeDepartment", middleware.checkToken, async (req, res) => {
    try {
      const pool = await poolPromise;
      let query =  "SELECT        DeptName, DepartmentId     FROM            Department";
     
  
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

router.get("/getEmployeeOfDepartment", middleware.checkToken, async (req, res) => {
    try {
      const pool = await poolPromise;
      let query =   " select ed.id as id,ed.DepartmentId as DepartmentId ,ed.Employeeid as Employeeid,Department.DeptName as DeptName,Employee.FirstName as FirstName,Employee.LastName as LastName from EmployeeDepartment as ed " +
      " inner join Employee  on Employee.EmployeeId = ed.Employeeid																		 " +
      " inner join Department on Department.DepartmentId =ed.DepartmentId																 " +
      " where ed.DepartmentId= '"+req.query.id+"'";
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
router.get("/getEmployeeOfDepartmentWithoutId", middleware.checkToken, async (req, res) => {
    try {
      const pool = await poolPromise;
      let query =   " select * from Employee";
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
  router.post("/postInternalConsumption", middleware.checkToken, async (req, res) => {
    try {
      const pool = await poolPromise;
      try {
          const recordset = await pool.request().input('DepartmentId', sql.Int, req.body.DepartmentId)

              .input('EmployeeId', sql.Int, req.body.EmployeeId)
              .input('IssuedOn', sql.Date, req.body.IssuedOn)
              .input('Description', sql.Text, req.body.Description)
              .input('User', sql.Int, req.body.User)
              .input('recSubData', sql.Text, req.body.recSub)
              .execute('internalConsumption');
          res.json(true);

      } catch (queryErr) {
          
          res.status(406).send("Something went wrong  " + queryErr);
      }
  } catch (err) {
      res.status(406)
      res.send(err.message)
  }
  });
  router.post("/update", middleware.checkToken, async (req, res) => {
    try {
      const pool = await poolPromise;
      try {
          const recordset = await pool.request().input('DepartmentId', sql.Int, req.body.DepartmentId)

              .input('EmployeeId', sql.Int, req.body.EmployeeId)
              .input('IssuedOn', sql.Date, req.body.IssuedOn)
              .input('Description', sql.Text, req.body.Description)
              .input('User', sql.Int, req.body.user)
              .input('recSubData', sql.Text, req.body.recSub)
              .input('internalConsumptionMainId', sql.Int, req.body.MainId)
              .execute('UpdateInternalConsumption');
          res.json(true);

      } catch (queryErr) {
          
          res.status(406).send("Something went wrong  " + queryErr);
      }
  } catch (err) {
      res.status(406)
      res.send(err.message)
  }
  });
  router.get('/getReceivedStoreItem', middleware.checkToken, async (req, res) => {

    try {
        const pool = await poolPromise;
         let query ="  select r.id,r.ItemName, r.ItemCode,																				 " +
         " (isnull(r.ItemQty,0) - isnull(i.ItemQty,0) + (select isnull(sum(ItemQty),0) from StoreItemIssueSub					 " +
         " where   StoreItemIssueSub.StoreItemIssueSubId=0	 )) as ItemQty from												 " +
         " (select StoreItems.id as id,ItemName,StoreItems.ItemCode,sum(ItemQty) as ItemQty from StoreItemReceivedSub  	 " +
         " inner join StoreItems on StoreItems.Id= StoreItemReceivedSub.ItemCode  											 " +
         " group by ItemName, StoreItems.ItemCode,StoreItems.Id ) r															 " +
         " Left join (select ItemName,StoreItems.ItemCode,StoreItems.id as id,sum(ItemQty) as ItemQty from StoreItemIssueSub " +
         " inner join StoreItems on StoreItems.Id=StoreItemIssueSub.ItemId  													 " +
         " group by ItemName, StoreItems.ItemCode,StoreItems.Id ) i on i.ItemCode = r.ItemCode "

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
router.get('/checkStoreItemQuantityById', middleware.checkToken, async (req, res) => {
  try {
      const pool = await poolPromise;
      let query ="  select ((select isnull(sum(ItemQty),0)  from StoreItemReceivedSub where  StoreItemReceivedSub.ItemCode ='"+req.query.itemid + "') - (select isnull(sum(ItemQty),0)  from StoreItemIssueSub where  StoreItemIssueSub.ItemId ='"+req.query.itemid + "') + (select isnull(sum(ItemQty),0) from StoreItemIssueSub where  StoreItemIssueSub.ItemId ='"+ req.query.itemid + "' and StoreItemIssueSub.storeItemIssueId='"+req.query.mainid + "' )) as ItemQty ,StoreItems.ItemName as ItemName  from StoreItemReceivedSub  " +
      "   inner join StoreItems on StoreItems.Id=StoreItemReceivedSub.ItemCode 																																																   " +
      "   where StoreItemReceivedSub.ItemCode ='"+req.query.itemid + "'																																																							   " +
      "   group By StoreItems.ItemName 	"																																																										   
     																																																										   
  
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
router.get('/getAllStoreItemConsumptionDetail', middleware.checkToken, async (req, res) => {
  try {
      const pool = await poolPromise;
          let query = `SELECT distinct Department.DeptName as DeptName,Employee.FirstName +' '+Employee.LastName as FullName ,                                  
               u.Firstname +' '+u.Lastname as uFullName,Convert ( varchar,IssueM.IssueDate,100) as IssueDate, Convert(varchar,IssueM.IssueDate,106) as orderdate,	IssueM.StoreItemIssueId as mainid,	
               (STUFF((SELECT ',' + CAST(ItemName AS VARCHAR(10)) [text()]      
               FROM StoreItemIssueMain inner join storeitemissuesub on StoreItemIssueMain.StoreItemIssueId = storeitemissuesub.[storeItemIssueId]	
               and StoreItemIssueMain.StoreItemIssueId =IssueM.StoreItemIssueId																		    
               inner join StoreItems on storeitemissuesub.ItemId = StoreItems.Id	   
                 FOR XML PATH(''), TYPE).value('.','NVARCHAR(MAX)'),1,1,' ')) as IssuedItems													    
               FROM StoreItemIssueMain as IssueM																																						   
               inner join Department on Department.DepartmentId = IssueM.IssueToDeptId																													   
               inner join Employee on Employee.EmployeeId = IssueM.IssueTo												   
               inner join [User] as u on u.Userid =IssueM.IssueBy  order by orderdate desc,mainid, DeptName, FullName ,uFullName`
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
router.get('/deleteStoreItem', middleware.checkToken, async (req, res) => {
  try {
    
      const pool = await poolPromise;
      let query =  " Delete from StoreItemIssueSub where StoreItemIssueSubId='"+req.query.SubId+"' "
      
                                                                                                                             
  
      try {
          const recordset = await pool.request().query(query); 
          if (recordset) {
         
              res.send(true)

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
router.get('/deleteRecord', middleware.checkToken, async (req, res) => {
  try {
    
      const pool = await poolPromise;
      let query =  " begin tran " +
     " delete from StoreItemIssueSub where storeItemIssueId ='"+ req.query.id +"'  " +
     " delete from StoreItemIssueMain where StoreItemIssueId='"+ req.query.id +"' " +
     " commit  tran  "
      
                                                                                                                             
      try {
          const recordset = await pool.request().query(query); 
          if (recordset) {
         
              res.send(true)

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
router.get('/getAllEmployee', middleware.checkToken, async (req, res) => {
  try {
    
      const pool = await poolPromise;
      let query =  "select FirstName,LastName,EmployeeId from Employee  "
      
                                                                                                                             
  
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
router.get('/getAllStoreItemConsumptionDetailById', middleware.checkToken, async (req, res) => {
  try {
    
      const pool = await poolPromise;
      let query =  " SELECT IssueM.IssueToDeptId as DepId,IssueM.IssueBy as [user],IssueM.IssueTo as EmployeeId,convert(varchar,IssueM.IssueDate,23)  as [Date], " +
      " storeItemIssuesub.ItemId as ItemId,StoreItemIssueSub.ItemQty as ItemQty,IssueM.StoreItemIssueId as ID,StoreItemIssueSub.StoreItemIssueSubId as id		  " +
      " ,IssueM.Description as Description FROM StoreItemIssueMain as IssueM																										  " +
      " inner join StoreItemIssueSub on StoreItemIssueSub.storeItemIssueId=IssueM.StoreItemIssueId 											  " +
      " where IssueM.StoreItemIssueId='"+req.query.id+"' "
      
                                                                                                                             
  
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


  module.exports = router;
