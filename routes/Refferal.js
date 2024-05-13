//#region declaration
let express = require('express');
let router = express.Router();
var sql = require('mssql/msnodesqlv8');
var nodemailer = require('nodemailer');
var bodyParser = require('body-parser');
let middleware = require('../middleware');
let configg = require('../config');
let jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
var fileExtension = require('file-extension');
const fs = require('fs');
const path = require('path');
let app = express();
const saltRounds = 10;
const {
    poolPromise
} = require('../database/db');
const {
    json
} = require('body-parser');


var storage = multer.diskStorage({

    // Setting directory on disk to save uploaded files
    destination: function (req, file, cb) {
        cb(null, '../Backend/Documents/childrefdata/' + req.query.id + '/');
        
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
        if (!file.originalname.match(/\.(pdf|jpg|jpeg)$/)) {
            //Error
            cb(new Error('Supported file: pdf,jpg,jpeg'))

        }
        //Success
        cb(undefined, true)

    }
})

router.post('/uploadfile', upload.single('latestprescription'), (req, res, next) => {
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
})


router.post('/childReferralRegister', async (req, res) => {
    try {
        const pool = await poolPromise;
        let duplicate_flag = 0;
        let duplicate_check_query = "SELECT * FROM ReferringPatientContact WHERE FirstName = '" + req.body.fname + "'And LastName = '" + req.body.lname + "' And PhoneNumberMobile = '" + req.body.contact + "'";
        
        try {
            const recordset = await pool.request().query(duplicate_check_query);
            
            
            duplicate_flag = recordset.recordset.length;
            // return;
            if (duplicate_flag > 0) {
                res.send({
                    duplicate: 'true'
                });
            } else {
                let query = "Insert into ReferringPatientContact (FirstName,LastName,GuardianName,PhoneNumberMobile,City,Address,ReferredBy,RegStatus,Priscription,Education,TestStrip,Insulin,Alloftheabove) Values  ('" + req.body.fname + "' ,'" + req.body.lname + "','" + req.body.guardian + "','" + req.body.contact + "','" + req.body.city + "','" + req.body.raddress + "','" + req.body.DoctorId + "','" + 0 + "','" + req.body.prespath + "','" + req.body.firstconsent + "','" + req.body.secondconsent + "','" + req.body.thirdconsent + "','" + req.body.fourthconsent + "')";
                
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
            }

        } catch (err) {
            res.status(406).send("Something went wrong  " + queryErr);
            return;
        }
    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});
router.get('/getchildReferal', async (req, res) => {
    try {
        const pool = await poolPromise;
        //FirstName,LastName,GuardianName,PhoneNumberMobile,City,Address,RegStatus,ReferredBy from ReferringPatientContact
        let query = "select * from ReferringPatientContact Where PatientId ='" + req.query.id + "' ";
        
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
        res.status(406)
        res.send(err.message)
    }
});
router.get('/getchildReferalbyRegStaus', async (req, res) => {
    try {
        const pool = await poolPromise;
        //FirstName,LastName,GuardianName,PhoneNumberMobile,City,Address,RegStatus,ReferredBy from ReferringPatientContact
        let query = "select * from ReferringPatientContact Where RegStatus ='" + req.query.id + "' ";
        
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
        res.status(406)
        res.send(err.message)
    }
});
router.post('/updateReferral', async (req, res) => {
    try {
        

        try {
            const pool = await poolPromise;
            let duplicate_flag = 0;
            let duplicate_check_query = "SELECT * FROM ReferringPatientContact WHERE (FirstName = '" + req.body.fname + "' AND PhoneNumberMobile = '" + req.body.contact + "') AND PatientId != '" + req.body.patientid + "'";
            

            try {
                const recordset = await pool.request().query(duplicate_check_query);
                
                
                duplicate_flag = recordset.recordset.length;
                // return;
                if (duplicate_flag > 0) {
                    res.send({
                        duplicate: 'true'
                    });
                } else {
                    let query = "update ReferringPatientContact SET  FirstName = '" + req.body.fname + "',LastName = '" + req.body.lname + "', GuardianName = '" + req.body.guardian + "', PhoneNumberMobile ='" +
                        req.body.contact + "', City = '" + req.body.city + "', Address ='" + req.body.raddress + "', ReferredBy ='" +
                        req.body.DoctorId + "', RegStatus ='" + 0 + "', Priscription ='" + req.body.prespath + "', Education ='" +
                        req.body.firstconsent + "',TestStrip ='" + req.body.secondconsent + "',Insulin ='" + req.body.thirdconsent + "',Alloftheabove ='" + req.body.fourthconsent + "'where PatientId= '" + req.body.patientid + "'";
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

                }

            } catch (err) {
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
router.get('/getlastid', async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = " select top(1) * from ReferringPatientContact order by PatientId desc";
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
router.post('/addfolder', function (req, res) {
     fs.access("./Documents/childrefdata/"+req.query.id, function(error) {
     if (error) {
    fs.mkdir(path.join('./Documents/childrefdata/', req.query.id), {
        recursive: true
    }, (err) => {
        if (err) {
            return console.error(err);
        }
        
        res.send(true);
    });
    }
    });

});
router.get('/getpathdatabyid', async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = " select da.DocsId,da.ModifiedDate,da.DocLink,da.DocType,da.FilePath from DocumentsAttached as da " +

            " where da.PatientId='" + req.query.id + "'";
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
router.delete('/deleteReferralbyid', async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = " DELETE FROM ReferringPatientContact WHERE PatientId='" + req.query.id + "'";

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
router.post('/updateReferralRegstatus', async (req, res) => {
    try {
        
        const pool = await poolPromise;
        // let query = "UPDATE ReferringPatientContact SET RegStatus='"+ req.query.statusid +"'  WHERE PatientId ='"+req.query.id+"'";
        let query = "UPDATE ReferringPatientContact SET RegStatus ='"+ req.query.statusid +"',Comment = '"+ req.query.comment+"'  WHERE PatientId ='"+req.query.id+"'";
        try {
            const recordset = await pool.request().query(query);
            if (recordset) {
                res.send(true);
            }
            else {
                res.send(false);
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
router.get('/getchildReferralinfo', async (req, res) => {
    try {
        const pool = await poolPromise;
        //FirstName,LastName,GuardianName,PhoneNumberMobile,City,Address,RegStatus,ReferredBy from ReferringPatientContact
        let query = "select  PatientId ,FirstName,LastName,PhoneNumberMobile,Address,ReferredBy,Comment,convert(varchar,CreatedDate,107) as CreatedDate," +
            "Education,TestStrip,InfoShareOnSocialMedia,Insulin,Alloftheabove,PackageHandling,ReferOtherDoctor,SupportSupplies," +
            "PercentageSupport,Date,Priscription,GuardianName,city.Name as CName,RegStatus from ReferringPatientContact inner join city on city.Id=City order by PatientId DESC;"
        
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
        res.status(406)
        res.send(err.message)
    }
});


//#endregion

//#endregion
module.exports = router;