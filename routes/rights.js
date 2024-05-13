//#region Declaration
let express = require('express');
let router = express.Router();
let middleware = require('../middleware');
const {
    poolPromise
} = require('../database/db');
let {
    executeDuplicateQuery,
    executeSelectQuery
} = require('./utills/functions');
//#endregion

/** Create */
router.post('/addRight', middleware.checkToken, async (req, res) => {
    let query = "insert into dbo.UserRights   ([RightId],[RoleId],[UserId],[IsArchive],[SidebarPage]) values('" +
        req.body.RightId + "','" + req.body.RoleId + "',null,'" + "false','false')";
    
    try {
        const pool = await poolPromise;
        try {
            const recordset = await pool.request().query(query);
            if (req.body.ReWashes > 0) {
                res.send(recordset.recordset);
            } else {
                res.send(true);
            }
        } catch (queryErr) {
            res.status(406).send("Something went wrong  " + queryErr);
            return;
        }
    } catch (error) {
        res.status(406)
        res.send(err.message)
    }
});
/** Update */
router.post('/addRightsPage', middleware.checkToken, async (req, res) => {
    let query = "insert into dbo.Rights   ([RightName] ,[RightURL] ,[MainHeading] ,[Icon],[IsArchive]  ,[SidebarPage]) values('" +
        req.body.RightName + "','" + req.body.RightUrl +"','" + req.body.MainHeading +"','" + req.body.Icon + "false','false')";
    
    try {
        const pool = await poolPromise;
        try {
            const recordset = await pool.request().query(query);
            if (req.body.ReWashes > 0) {
                res.send(recordset.recordset);
            } else {
                res.send(true);
            }
        } catch (queryErr) {
            res.status(406).send("Something went wrong  " + queryErr);
            return;
        }
    } catch (error) {
        res.status(406)
        res.send(err.message)
    }
});

router.post('/updateRight', middleware.checkToken, async (req, res) => {
    let query = "update dbo.UserRights set RightId='" + req.body.RightId + "', RoleId='" + req.body.RoleId + "',UserId='" + req.body.UserId + "', IsArchive ='1'  where ID='" + req.body.ID + "'"
    executeDuplicateQuery(query).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });
});
/////new query added 6/22/2022
router.post('/updateUserAssignedRightNewPage', middleware.checkToken, async (req, res) => {
    let query = "DELETE FROM UserAssignedRights  WHERE RightId='" + req.body.RightId + "' And UserId='" + req.body.UserId + "'"
    executeDuplicateQuery(query).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });
});
router.post('/InsertNewUserAssignedRightNewPage', middleware.checkToken, async (req, res) => {
    let query = "Insert UserAssignedRights  (RightId,UserId) Values('" + req.body.RightId + "','" + req.body.UserId + "')"
    executeDuplicateQuery(query).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });
});
router.get('/getAllUser', middleware.checkToken, async (req, res) => {
    let query = "  select (Firstname+' '+Lastname) as UserName,Userid as UserId from [User] where Active= 1 "
    executeSelectQuery(query).then((success) => {
      res.send(success)
    }, (error) => {
        res.json(error);
    });
});
///////////////end
router.post('/updateUserAssignedRight', middleware.checkToken, async (req, res) => {
    let query = "update UserAssignedRights set RightId='" + req.body.RightId + "',UserId='" + req.body.UserId + "',where ID='" + req.body.ID + "'"
    executeDuplicateQuery(query).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });
});
router.get('/getupdateRight', middleware.checkToken, async (req, res) => {
    let query = "select * from  UserRights"
    executeSelectQuery(query).then((success) => {
        res.send(recordset.recordset);
    }, (error) => {
        res.json(error);
    });
});
/** Delete */

router.get('/deleteRight', middleware.checkToken, async (req, res) => {
    
    

    let query = "delete from UserRights where ID = " + req.query.ID;
    executeDuplicateQuery(query).then((success) => {
        // res.send(success);
        let query2 = "delete from UserAssignedRights where RightId = " + req.query.RightId;
        executeDuplicateQuery(query2).then((success) => {
            res.send(success);
        }, (error) => {
            res.json(error);
        });
    }, (error) => {
        res.json(error);
    });
});
/** Get All Rights by RoleID  for Update*/

router.get('/getAllRightsbyRoleId', middleware.checkToken, async (req, res) => {
    //old
    // let query = "select * from rights left outer join " +
    //     "UserRights on UserRights.RightId = Rights.RightId " +
    //     "where rights.RightId not in(select RightId from UserRights where RoleId='" + req.query.roleid + "')";
    //new
    let query = "select * from rights " +
        "where rights.RightId not in(select RightId from UserRights where RoleId='" + req.query.roleid + "')";
    executeSelectQuery(query).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });
});
/**get All Simple Rights */

router.get('/getAllRightsnew', middleware.checkToken, async (req, res) => {
    let query = "SELECT        Rights.RightId, Rights.MainHeading, Rights.RightName, Rights.RightURL,ISNULL(UserAssignedRights.UserId,0) as UserId "+
    " FROM            Rights Left JOIN " +
    "                         UserAssignedRights ON Rights.RightId = UserAssignedRights.RightId and UserAssignedRights.UserId='"+req.query.id+"' "+
    " WHERE        (Rights.IsArchive = 'false')  "+
    " ORDER BY Rights.MainHeading ASC ";
    executeSelectQuery(query).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });
});
/** Get by Id  */

router.get('/getRightById', middleware.checkToken, async (req, res) => {
    let query = "select RoleId, UserId,  UserRights.RightId, Rights.RightName from UserRights " +
        " INNER JOIN Rights on Rights.RightId=UserRights.RightId " +
        " where RoleId='" + req.query.BatchId + "'and 24 and UserId=32yyyyyy";
    executeSelectQuery(query).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });
});
/**Get Rights by Id on the bases of RoleId */
router.get('/getRightsbyRoleIdById', middleware.checkToken, async (req, res) => {
    let query = "select RoleId, UserId,  UserRights.RightId, Rights.RightName, UserRights.ID  from UserRights " +
        " INNER JOIN Rights on Rights.RightId=UserRights.RightId " +
        " where RoleId='" + req.query.roleid + "' and UserRights.IsArchive=0"
    executeSelectQuery(query).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });
});

/**Get all the record to whom we have assign rights on the bases of userid and role id */
router.get('/getAllAssignRights', middleware.checkToken, async (req, res) => {
    let query = "select  UserRights.RoleId,Roles.RoleName,count(UserRights.RightId) as total_rights from UserRights " +
        " inner join Roles on Roles.RoleId=UserRights.RoleId " +
        " group by UserRights.RoleId,Roles.RoleName";
    executeSelectQuery(query).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });

});

/**Get all the records of Users which have not been assign any rights yet  */
router.get('/GetAllUnAssignRights', middleware.checkToken, async (req, res) => {
    let query = "select * from [User] left outer  join " +
        " UserRights on UserRights.UserId = [User].Userid " +
        " where [User].Userid not in(select UserId from UserRights) and [User].IsArchive ='false' and [User].Active ='true' ";
    executeSelectQuery(query).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });
});
/** Add rights page to db  */
router.post('/addRightsidebar', middleware.checkToken, async (req, res) => {
    let query=  " INSERT INTO Rights (RightName, MainHeading,RightURL,Icon,SidebarPage,IsArchive) " +
      " VALUES ('"+req.body.rightname+"', '"+req.body.mainheading+"' ,'"+req.body.righturl+"', '"+req.body.icon+"' ,'"+req.body.Sidebar+"', '"+req.body.Archive+"' );"
  
      try {
          const pool = await poolPromise;
          try {
              const recordset = await pool.request().query(query);
              if (res) {
                  res.send(true);
              } else {
                  res.send(false);
              }
          } catch (queryErr) {
              res.status(406).send("Something went wrong  " + queryErr);
              return;
          }
      } catch (error) {
          res.status(406)
          res.send(err.message)
      }
  });
module.exports = router;