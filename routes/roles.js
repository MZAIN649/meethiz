//#region Declaration
let express = require('express');
let router = express.Router();
let format = require('date-fns/format');
let middleware = require('../middleware');
const { poolPromise } = require('../database/db');
const { sql } = require('../database/db');
let { executeDuplicateQuery, executeSelectQuery } = require('./utills/functions');
//#endregion

/** ADD ROLES*/
router.post('/addRole', middleware.checkToken, async (req, res) => {
    let query = "insert into Roles   ([RoleName] ,[RoleStatus] ,[ModifiedDate]) values('" + req.body.Name + "','" + 1 + "'," + null + "); select @@identity ;"
    executeDuplicateQuery(query).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });

});

/**GET ALL  ACTIVE ROLES */
router.get('/allRoles', middleware.checkToken, async (req, res) => {
    let query = "select RoleId, RoleName,RoleStatus, CONVERT(VARCHAR(20), ModifiedDate, 107) as Modified_Date from roles where RoleStatus='1' ORDER BY RoleId DESC";
    executeSelectQuery(query).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });
});

/**
 * Delete Role > Deactivate 
 * DELETE BY ID > ID Query parameter 
 */
router.get('/deleteRoles', middleware.checkToken, async (req, res) => {
    let query = "update roles set RoleStatus='0'  where Roleid='" + req.query.Roleid + "'";
    executeDuplicateQuery(query).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });
});

/**Edit Role*/
router.post('/updateRole', middleware.checkToken, async (req, res) => {
    let query = "update Roles  set RoleName= '" + req.body.RoleName + "', ModifiedDate='" + format(new Date, 'MM/dd/yyyy H:mm:ss') + " ' where RoleStatus='1' and Roleid='" + req.body.Roleid + "'";
    executeDuplicateQuery(query).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });

});

/** Get Role by ID*/
router.get('/getRoleById', middleware.checkToken, async (req, res) => {
    let query = `select RoleId, RoleName,RoleStatus, convert(varchar, ModifiedDate, 0)
     Modified_Date from roles where Roleid=${req.query.Roleid}`
    executeSelectQuery(query).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });
});

/**
 * ASSIGN ROLES TO USERS 
 * Input > userid and roleid
 * */
router.post('/assignRole', middleware.checkToken, async (req, res) => {
    let q = `select * from UserRoles where UserId=${req.body.Userid} and RoleId=${req.body.RoleId}`;
    let q1 = `insert into UserRoles values('${req.body.RoleId}','${req.body.Userid}', '1', null)`;

    try {
        const pool = await poolPromise;
        try {
            const recordset = await pool.request().query(q);
            if (recordset.recordset.length) {
                return res.json('Duplicate');
            } else {
                try {
                    await pool.request().query(q1);
                    res.send(true);
                }
                catch (e) {
                    if (queryErr.number == 2601) {
                        return res.json('Duplicate');
                    }
                    res.status(406).send(queryErr);
                }
            }
        }
        catch (queryErr) {
            res.status(406).send("Something went wrong  " + queryErr);
            return;
        }
    }
    catch (error) {
        res.status(406)
        res.send(err.message)
    }
});

/*** SHOW ALL ROLES ASSIGNMENTS*/
router.get('/allRoleAssignments', middleware.checkToken, async (req, res) => {
    let query = "select u.Userid," +
        "u.Firstname+' '+u.Lastname as UserName , r.RoleName , ur.ModifiedDate , ur.RoleId" +
        " from [dbo].[User] u , Roles r, UserRoles ur where " +
        "ur.UserId= u.Userid and ur.RoleId=r.RoleId and ur.Status='1'";

    executeSelectQuery(query).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });
});

/*** DEACTIVATE ROLE ASSIGNMENT-> by id*/
router.get('/deactivateRoleAssignments', middleware.checkToken, async (req, res) => {
    let query = `delete from UserRoles where UserId=${req.query.UserId} and RoleId=${req.query.RoleId}`;
    let query1 = `delete from UserAssignedRights where UserId=${req.query.UserId} and RoleId=${req.query.RoleId}`
    executeDuplicateQuery(query).then((success) => {
        executeDuplicateQuery(query1).then((success) => {
            res.send(success);
        }, (error) => {
            res.json(error);
        });
    }, (error) => {
        res.json(error);
    });

});

/**Get all those records of roles which does not assigned any rights in Rights TAble */
router.get('/getNotAssignedRolesRights', middleware.checkToken, async (req, res) => {
    let query = "select Roles.RoleId, RoleName from  Roles where RoleId not in(Select ISNULL(RoleId,0) from UserRights)";
    executeSelectQuery(query).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });
});

/**Get all those records of roles which does  assigned any rights in Rights TAble */
router.get('/getAssignedRolesRights', middleware.checkToken, async (req, res) => {
    let query = "select Roles.RoleId, RoleName from  Roles where RoleId  in(Select RoleId from UserRights)";
    executeSelectQuery(query).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });
});

/**AssignRightsToUser storedprocedure */
router.post('/AssignRightsToUser', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        const recordset = await pool.request().input('UserId', sql.Int, req.body.UserId)
            .input('roleId', sql.Int, req.body.roleId)
            .execute('AssignRightsToUser');
        if (recordset.returnValue == 0) {
            res.send(true);
        }
        else {
            res.send(false);
        }
    }
    catch (err) {
        res.status(406);
        res.send(err.message);
    }
});

/**getRights for Edit Assigned Role */
router.get('/getRights', middleware.checkToken, async (req, res) => {
    let query = `select ur.Id, ur.RightId,ur.UserId , r.RightName, u.Firstname + ' '+ u.Lastname as UserName
    from UserAssignedRights ur 
    inner join Rights r on r.RightId= ur.RightId
    inner join [User] u on u.Userid= ur.UserId
    where ur.UserId=`+ req.query.Userid + ' and RoleId=' + req.query.RoleId;
    executeSelectQuery(query).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });
});

/**deleteAsssignedRight */
router.get('/deleteAsssignedRight', middleware.checkToken, async (req, res) => {
    let query = `delete  from UserAssignedRights where Id=` + req.query.Id;
    executeDuplicateQuery(query).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });
});


router.get('/getAllNotAssignedRights', middleware.checkToken, async (req, res) => {
    let query = `select Rights.RightName, RoleId,UserId,ID,Rights.RightId from UserRights 
    inner join Rights on Rights.RightId=UserRights.Rightid 
    where roleid=${req.query.RoleId}
    and UserRights.Rightid not in (select rightid from [UserAssignedRights]
        where userid =${req.query.Userid} )`
    executeSelectQuery(query).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });
});

router.post('/AddNewRight', middleware.checkToken, async (req, res) => {
    let query = "insert into UserAssignedRights values('" + req.body.RightId + "','" + req.body.UserId + "','" + req.body.RoleId + "');"
    executeDuplicateQuery(query).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });
});

router.get('/getAssignedRolesRightsNew', middleware.checkToken, async (req, res) => {
    let query =" Select MainHeading, icon ,(select pagename,link,RightId, userId  For JSON PATH) dropDown from ( " +
    " SELECT  Rights.RightName as pagename, Rights.RightURL as link, Rights.MainHeading  as MainHeading, Rights.Icon as icon,Rights.RightId AS RightId, isnull (UserAssignedRights.UserId,0 )AS userId " +
    " FROM Rights left JOIN " +
    " UserAssignedRights ON UserAssignedRights.RightId = Rights.RightId and UserAssignedRights.UserId ="+req.query.id+"    " +
    ") p order by MainHeading,pagename  ASC "

    executeSelectQuery(query).then((success) => {
        res.send(res);
    }, (error) => {
        res.json(error);
    });
});

module.exports = router;