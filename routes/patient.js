//#region declaration
let express = require('express');
let router = express.Router();
var sql = require('mssql/msnodesqlv8');
var nodemailer = require('nodemailer');
var bodyParser = require('body-parser');
let middleware = require('../middleware');
const {
    poolPromise
} = require('../database/db');
const {
    json
} = require('body-parser');


//Patient Register
router.post('/patientRegister', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        console.log("aaa")
        console.log("insert into dbo.Patient ([PatientFirstName],[PatientLastName],[ReligionEthnicity],[Gender],[City],[Class],[DateofBirth]"
        +",[PatientPhoto],[SchoolName],[SchoolAddress],[ResidentialAddress],[PostalAddress],[CreatedDate],[FatherName]," 
        +"[FatherContact],[FatherOccupation],[FatherCNIC],[FatherCNICPhoto],[MotherName],[MotherContact],[MotherOccupation],[MotherCNIC],[MotherCNICPhoto],"
        +"[GuardianName],[GuardianContact],[GuardianOccupation],[GuardianCNIC],[GuardianCNICPhoto],[PublicMedia],[SharingWithSponsors],[CaseStudies],[RegStatus],"
        +"[Comments],[ReferredBy],[PercentageSupport],[Filepath],[UpdateTime],[LfacSupport],[PoiNo],[ReferredId]) values ('" +
            req.body.FirstName + "','" + req.body.LastName + "','" + req.body.Phone + "','" + req.body.Email + "','" + req.body.Cnic +
            "','" + req.body.Address + "'," + req.body.PatientType + ",'" + req.body.BirthDate + "'," + req.body.Weight + "," + req.body.MaritalStatus +
            "," + req.body.LabId + ",'" + req.body.EmailCode + "'," + null + ",getdate(),null,0)");
        let query = "insert into dbo.Patient values ('" +
            req.body.FirstName + "','" + req.body.LastName + "','" + req.body.Phone + "','" + req.body.Email + "','" + req.body.Cnic +
            "','" + req.body.Address + "'," + req.body.PatientType + ",'" + req.body.BirthDate + "'," + req.body.Weight + "," + req.body.MaritalStatus +
            "," + req.body.LabId + ",'" + req.body.EmailCode + "'," + null + ",getdate(),null,0)";

        try {
            const recordset = await pool.request().query(query);
            if (recordset) {
                res.send(recordset.recordset);
                var mailOptions = {
                    from: 'iotdpl2@gmail.com',
                    to: 'jalalalone371@gmail.com',
                    subject: 'Sending Email using Node.js',
                    text: req.body.EmailCode
                };
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
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

//get ALl Test Lab
router.get('/getAllTest', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "select * from testlab";
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

//get Test Detail
router.get('/getTestDetail', async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "select * from testlab where name='" + req.query.name + "'";
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

//get Test Detail
router.get('/getEditTestDetail', async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "select * from Test_data where Id='" + req.query.Id + "'";
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

//get Test Detail
router.get('/getPateintbyId', async (req, res) => {
    console.log(req.query.PatientId, "p");
    console.log(req.body.PatientId, "q");
    console.log(req.query, "er");
    console.log(req.body.PatientId, "s");
    try {
        const pool = await poolPromise;
        let query = "select * from Patient where PatientId='" + req.query.PatientId + "'";
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

//get ALL PatientData
router.get('/getAllPatient', async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "SELECT * FROM Patient WHERE RegStatus = '3' ";
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


// Random Number Generate
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
//Email
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'iotdpl2@gmail.com',
        pass: 'dpl@12345'
    }
});


module.exports = router;