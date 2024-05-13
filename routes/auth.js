//#region declaration
let express = require('express');
let router = express.Router();
var sql = require('mssql/msnodesqlv8');
var nodemailer = require('nodemailer');
var bodyParser = require('body-parser');
let middleware = require('../middleware');
let configg = require('../config');
let jwt = require('jsonwebtoken');
const multer = require('multer');
var fileExtension = require('file-extension');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const {
    poolPromise
} = require('../database/db');
const {
    json
} = require('body-parser');
let {
    executeDuplicateQuery,
    executeSelectQuery
} = require('./utills/functions');
let format = require('date-fns/format');
const { user } = require('../database/config');

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    secure:true,
    auth: {
        user: 'Zmeethi@gmail.com',
        pass: 'Zmeethi123456'
    },
});

var storage = multer.diskStorage({

    // Setting directory on disk to save uploaded files
    destination: function (req, file, cb) {
        cb(null, '../BackEnd/Documents/userData/' + req.query.id + '/');
        
    },

    // Setting name of file saved
    filename: function (req, file, cb) {
        
        cb(null, file.originalname.substring(0, file.originalname.indexOf(".")) + req.query.date + '.' + fileExtension(file.originalname))
    }
})



var upload = multer({
    storage: storage,
    limits: {
        // Setting Image Size Limit to 2MBs
        fileSize: 2000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|.bmp)$/)) {
            //Error
            cb(new Error('Please upload image png/jpg/jpeg files only!'))

        }
        //Success
        cb(undefined, true)

    }
})





/***  REGISTER REQUEST TO REGISTER THE USER*/
router.post('/register', async (req, res) => {
    /**
     * First of all check if given Email already exists in DB
     * If it does not exist , then add the record
     */
    try {
        const pool = await poolPromise;
        let query = "select * from [dbo].[User]  where Email='" + req.body.Email + "'";
        const recordset = await pool.request().query(query);
        try {
            if (recordset.recordset.length) {
                //
                res.send(false);
            } else {
                /** Ecrypt password */
                bcrypt.genSalt(saltRounds, function (err, salt) {
                    bcrypt.hash(req.body.Password, salt, async (err, encrypted) => {
                        //
                        let q = "insert into [dbo].[User] ([Firstname],[Lastname],[Password],[IsArchive],[Email],[CreatedDate],[ModifiedDate],[Active],[LastAccess])   values('" + req.body.Firstname + "','" + req.body.Lastname + "','" + encrypted + "','" + false + "','" + req.body.Email + "','" + format(new Date, 'MM/dd/yyyy H:mm:ss') + "'," + null + ",'false',null)";
                        try {
                            await pool.request().query(q);
                        } catch (e) {
                            
                            res.status(406).send("Error in Registering User");
                        }
                        res.status(200).send(true);
                    })
                });
            }
        } catch (e) {
            
            res.status(406).send("Error in Registering User");
        }
    } catch (err) {
        res.send(err.message || err.toString())
    }
});
router.post('/duplicatecheck', async (req, res) => {
    /**
     * First of all check if given Email already exists in DB
     * If it does not exist , then add the record
     */
    try {
        const pool = await poolPromise;
        let query = "select * from [dbo].[User]  where Email='" + req.query.id + "'";
        const recordset = await pool.request().query(query);
        try {
            if (recordset.recordset.length) {
                //
                res.send(true);
            } 
            else {
                res.send(false);
            }
        } catch (e) {
            
            res.status(406).send("Error in Registering User");
        }
    } catch (err) {
        res.send(err.message || err.toString())
    }
});
/** ACTIVATE USER ( CALL BY ADMIN)*/
router.get('/activate', middleware.checkToken, async (req, res) => {
    let query = "update  [dbo].[User] set Active ='" + 1 + "' , ModifiedDate='" + format(new Date, 'MM/dd/yyyy H:mm:ss') + "'where Email='" + req.query.Email + "'";
    executeDuplicateQuery(query).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });
});
/*** LOGIN REQUEST*/
router.post('/login', async (req, res) => {
    try {
        
        const pool = await poolPromise;
        
        let validEmailQuery = 'select * from [dbo].[User] where Email=' + "'" + req.body.Email + "'";
        try {
            const recordsetMain = await pool.request()
                .query(validEmailQuery)
            if (recordsetMain.recordset[0] == null) {
                //
                return res.json('Email Does Not Exist');
            } else {
                /**
                 * EMAIL IS VALID -> PASSWORD VERIFICATION
                 */
                let password = recordsetMain.recordset[0].Password;
                bcrypt.compare(req.body.Password, password, async function (err, result) {
                    //
                    if (result) {
                        let q = 'select Active from [dbo].[User] where Email=' + "'" + req.body.Email + "'";
                        try {
                            const recordset = await pool.request()
                                .query(q)
                            if (recordset.recordset[0].Active) {

                                let lastAccessquery = "update  [dbo].[User] set LastAccess = '" + format(new Date, 'MM/dd/yyyy H:mm:ss') + "' where Email='" + req.body.Email + "'";
                                try {
                                    await pool.request().query(lastAccessquery);
                                    let token =
                                        jwt.sign({
                                                username: req.body.Email
                                            },
                                            configg.secret, {
                                                expiresIn: '7d'
                                            }
                                            // expires in 24 hours
                                        );
                                        
                                    res.json({
                                        success: true,
                                        message: 'Authentication successful!',
                                        token: token,
                                        expiresIn: 7200,
                                    });
                                   
                                  
                                } catch (queryErr) {
                                    res.status(406).send("Something went wrong  " + queryErr);
                                    return;
                                }
                                /**
                                 * UPDATE LAST ACCESS TIME OF LOGIN TABLE
                                 */

                            } else {
                                /* res.status(406).send("Please Contact Admin to Activate your ID"); */
                                // res.status(406).send(false);
                                res.send(false);
                            }
                        } catch (queryErr) {
                            res.status(406).send('Something went wrong' + queryErr);
                            return;
                        }


                    } else {
                        return res.json('Invalid Password');
                    }
                })
            }
        } catch (queryErr) {
            res.status(406).send('Something went wrong' + queryErr);
            return;
        }
    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
    /**
     * CHECK IF IT IS A VALID REGISTERED EMAIL
     */

});

//#region   Commented Code
/**
 * LOGOUT SESSION
 *
 * router.get('/logout',(req,res) => {
    sess=req.session;
    req.session.destroy();
    
    res.status(200).send(true);
});
 */
//#endregion

//return all users > active and non active users both
router.get('/getAllUsers', middleware.checkToken, async (req, res) => {
    let query = "select " +
        "Userid, u.Firstname, u.Lastname, Password, u.Email, Active, " +
        "convert(varchar, u.CreatedDate, 0) CreatedDate , " +
        "convert(varchar, u.ModifiedDate, 0) Modified_Date, " +
        "convert(varchar, u.LastAccess, 0) LastAccess , " +
        "Employee.FirstName+Employee.LastName as EmployeeName from [dbo].[User] u , Employee " +
        " where  u.isArchive='false'" +
        "and Employee.EmployeeId= u.EmployeeId";
    executeSelectQuery(query).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });
});
//return active users
router.get('/getActiveUsers', middleware.checkToken, async (req, res) => {
    let query = "select " +
        "Userid, u.Firstname, u.Lastname, Password, u.Email, Active, " +
        "convert(varchar, u.CreatedDate, 0) CreatedDate , " +
        "convert(varchar, u.ModifiedDate, 0) Modified_Date, " +
        "convert(varchar, u.LastAccess, 0) LastAccess  " +
        "from [dbo].[User] u " +
        " where  u.isArchive='false' and u.Active='1'";
    executeSelectQuery(query).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });
});
//return non active users> new user requests
router.get('/getDeactiveUsers', middleware.checkToken, async (req, res) => {
    let query = " select " +
        " Userid, u.Firstname, u.Lastname, u.Email, Active, " +
        " convert(varchar, u.CreatedDate, 0) CreatedDate , " +
        " convert(varchar, u.ModifiedDate, 0) Modified_Date, " +
        " convert(varchar, u.LastAccess, 0) LastAccess " +
        " from [dbo].[User] u where    u.Active='0'";
    executeSelectQuery(query).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });
});
/** * DELETE USER*/
router.get('/deactivateUser', middleware.checkToken, async (req, res) => {

    try {
        const pool = await poolPromise;
        let query = "update  [dbo].[User] set Active ='" + 0 + "' , ModifiedDate='" + format(new Date, 'MM/dd/yyyy H:mm:ss') + "'where Email='" + req.query.Email + "'";
        try {
            await pool.request().query(query);
            let updateRoles = "update UserRoles set Status='0' , ModifiedDate='" + format(new Date, 'MM/dd/yyyy H:mm:ss') +
                "'where UserId IN(select Userid from [dbo].[User] where Email='" + req.query.UserName + "')";
            try {
                await pool.request().query(updateRoles);
                //
                res.status(200).send(true);
            } catch (queryErr) {
                res.status(406).send("Something went wrong  " + queryErr);
                return;
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
//delete user > set active  false and isarchive to true
router.get('/DeleteUser', middleware.checkToken, async (req, res) => {
    let query = "update  [dbo].[User] set isArchive='true', Active ='" + 1 + "' , ModifiedDate='" + format(new Date, 'MM/dd/yyyy H:mm:ss') + "'where Email='" + req.query.Email + "'";
    executeDuplicateQuery(query).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });
});
//get current user email
router.get('/getCurrentUserName', middleware.checkToken, async (req, res) => {
    let query = "select * from [User] where Email='" + req.query.Email + "'";
    executeSelectQuery(query).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });
});
//check if current Login User(UserId) exist in UserRights
router.get('/checkUserRights', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "Select distinct UserRoles.RoleId,UserId, Roles.RoleName from UserRoles " +
            " Inner Join Roles On UserRoles.RoleId=Roles.RoleId" +
            " where UserId=(select Userid from [User]  where Email='" + req.query.Email + "')";
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
//check User has Access of this page
router.get('/checkUserHasAccess', middleware.checkToken, async (req, res) => {
    let query = "select distinct UserRoles.UserId,UserRoles.RoleId, UserAssignedRights.RightId from UserRoles " +
        " inner join UserAssignedRights on UserAssignedRights.RoleId=UserRoles.RoleId " +
        " inner join Rights on Rights.RightId=UserAssignedRights.RightId " +
        " where UserRoles.RoleId in (select [value] from [STRING_SPLIT]('" + req.query.RoleId + "' ,',')) and UserRoles.UserId='" + req.query.UserId + "' and Rights.RightURL='" + req.query.RightURL + "'";


    executeSelectQuery(query).then((success) => {
        res.send(success);
    }, (error) => {
        res.json(error);
    });
});

router.post('/forgotPassword', async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = 'select * from [dbo].[User] where Email=' + "'" + req.body.Email + "'";
        try {
            const recordset = await pool.request().query(query);
            // res.send(recordset.recordset);
            if (recordset.recordset[0] == null) {
                // 
                return res.json('Email Does Not Exist');
            } else {
                /*** EMAIL IS VALID -> Update the PASSWORD*/
                // 
                // 
                bcrypt.genSalt(saltRounds, function (err, salt) {
                    bcrypt.hash(req.body.Password, salt, async (err, encrypted) => {
                        try {
                            let updateUserQuery = "update  [dbo].[User] set Password = '" + encrypted + "' where Email='" + req.body.Email + "'";
                            await pool.request().query(updateUserQuery);
                            res.send(true);
                        } catch (queryErr) {
                            res.status(406).send("Something went wrong  " + queryErr);
                            return;
                        }
                    });
                });
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

/*** Password Match REQUEST*/
router.post('/matchPassword', async (req, res) => {
    
    
    try {
        const pool = await poolPromise;
        
        let validEmailQuery = 'select * from [dbo].[User] where Email=' + "'" + req.body.Email + "'";
        try {
            const recordsetMain = await pool.request()
                .query(validEmailQuery)
            if (recordsetMain.recordset[0] == null) {
                //
                return res.json('Email Does Not Exist');
            } else {
                /**
                 * EMAIL IS VALID -> PASSWORD VERIFICATION
                 */
                let password = recordsetMain.recordset[0].Password;
                bcrypt.compare(req.body.Password, password, async function (err, result) {
                    //
                    if (result) {
                        let q = 'select Active from [dbo].[User] where Email=' + "'" + req.body.Email + "'";
                        try {
                            const recordset = await pool.request()
                                .query(q)
                            if (recordset.recordset[0].Active) {

                                let lastAccessquery = "update  [dbo].[User] set LastAccess = '" + format(new Date, 'MM/dd/yyyy H:mm:ss') + "' where Email='" + req.body.Email + "'";
                                try {
                                    await pool.request().query(lastAccessquery);
                                    let token =
                                        jwt.sign({
                                                username: req.body.Email
                                            },
                                            configg.secret, {
                                                expiresIn: '24h'
                                            }
                                            // expires in 24 hours
                                        );
                                    res.json({
                                        success: true,
                                        message: 'Authentication successful!',
                                        token: token
                                    });
                                } catch (queryErr) {
                                    res.status(406).send("Something went wrong  " + queryErr);
                                    return;
                                }
                                /**
                                 * UPDATE LAST ACCESS TIME OF LOGIN TABLE
                                 */

                            } else {
                                /* res.status(406).send("Please Contact Admin to Activate your ID"); */
                                // res.status(406).send(false);
                                res.send(false);
                            }
                        } catch (queryErr) {
                            res.status(406).send('Something went wrong' + queryErr);
                            return;
                        }


                    } else {
                        return res.json('Invalid Password');
                    }
                })
            }
        } catch (queryErr) {
            res.status(406).send('Something went wrong' + queryErr);
            return;
        }
    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
    /**
     * CHECK IF IT IS A VALID REGISTERED EMAIL
     */

});
router.post('/EmailMessages', async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = " select Firstname,Lastname from [User] where Email ='" + req.body.Email + "'";
        try {
            const recordset = await pool.request().query(query);
            if (recordset) {
               let FullName =recordset.recordset[0].Firstname+' '+recordset.recordset[0].Lastname;
                res.send(true);
                transporter.sendMail({from:'Zmeethi@gmail.com',
                                      to:req.body.Email,
                                      subject:'New Login Message', // Subject line
// html : { path:"/FrontEnd/src/app/pages/reports/stock/" }
                                      html: `<div class="card" style="width: 18rem;">
                                      <img class="card-img-top" src="https://meethizindagi.org/wp-content/uploads/2020/08/logo-MZ-site.png">
                                      <div class="card-body">
                                      <h4 class="card-title">Hey `+FullName+`</h4>
                                       Your account at MeethiZindagi was accessed at:<strong> "`+format(new Date, 'MM/dd/yyyy H:mm:ss a')+`"</strong>

                                      </div>
                                      </div>`,

                                     });
               
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


// router.post('/sendmail',async (req, res) => {
//     
//     
//     var mailOptions = {
//         from: 'jalalalone371@gmail.com',
//         to: req.body.Email,
//         subject: 'Password Recovery',
//         text: 'Your password is ' +req.body.key
//       };
      
//       transporter.sendMail(mailOptions, function(error, info){
//         if (error) {
//           
//         } else {
//           res.send(true);
//         }
//       });
// });

router.post('/sendmail',async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = " select Firstname,Lastname from [User] where Email ='" + req.body.Email + "'";
        try {
            const recordset = await pool.request().query(query);
            if (recordset) {
               let FullName =recordset.recordset[0].Firstname+' '+recordset.recordset[0].Lastname;
            
                var mailOptions = {
                    from: 'Zmeethi@gmail.com',
                    to: req.body.Email,
                    subject:'Password Recovery', // Subject line
            // html : { path:"/FrontEnd/src/app/pages/reports/stock/" }
                    html: `<div class="card" style="width: 18rem;">
                   <img class="card-img-top" src="https://meethizindagi.org/wp-content/uploads/2020/08/logo-MZ-site.png">
                     <div class="card-body">
                     <h4 class="card-title">Hey `+FullName+`</h4>
                     Your code to reset password is <strong> "`+req.body.key+`"</strong>
            
                     </div>
                        </div>`
                  };
                  
                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      
                    } else {
                      res.send(true);
                    }
                  });
               
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
router.get('/userProfileById', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "Select * from [User] where Userid ='"+req.query.id+"' ";
        try {
            const recordset = await pool.request().query(query);
            if (recordset) {
                res.send(recordset.recordset[0]);
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

router.post('/addfolder', function (req, res) {
    fs.access("./Documents/UserData/"+req.query.id, function(error) {
    if (error) {
   fs.mkdir(path.join('./Documents/UserData/', req.query.id), {
       recursive: true
   }, (err) => {
       if (err) {
           console.error(err);
           res.send(false);
           return ;
       }
   });
   
   res.send(true);
   }
   });

});
router.post('/uploadfile', upload.single('uploadedImage'), (req, res, next) => {
    const file = req.file;
    
    let originalpath = file.filename;
    
    if (!file) {
        const error = new Error('Please upload a file')
        error.httpStatusCode = 400
        return next(error)
    }
    res.json({
        statusCode: 200,
        status: 'success',
        path: originalpath
    })
    
    //res.json(path)

}, (error, req, res, next) => {
    res.status(400).send({
        error: error.message
    })
});
router.post('/updateRecord', async (req, res) => {
    try {
        
        const pool = await poolPromise;
        let query = "update [User] set Firstname = '" +req.body.FirstName + "', Lastname= '" + req.body.LastName + "', Email= '" + req.body.Email + "',[File]= '" + req.body.uploadedImage + "' where Userid= '" + req.body.Id + "' ";
        
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
        res.status(406)
        res.send(err.message)
    }
});

module.exports = router;