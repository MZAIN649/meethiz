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
const {
    Console
} = require('console');
const { Date } = require('mssql/msnodesqlv8');
const { getDate } = require('date-fns');


//directory code
router.get('/addfolder', function (req, res) {
    fs.access("./Documents/childrefdata/"+req.query.id, function(error) {
        if (error) {
    fs.mkdir(path.join('./Documents/childdata/', req.query.id), {
        recursive: true
    }, (err) => {
        if (err) {
            return console.error(err);
        }
        
    });
}
});

});
router.get('/addfolder1', function (req, res) {
    fs.access("./Documents/childdata/"+req.query.id, function(error) {
        if (error) {
    fs.mkdir(path.join('./Documents/childdata/', req.query.id), {
        recursive: true
    }, (err) => {
        if (err) {
            return console.error(err);
        }
        
    });
}
});

});

// router.get('/addfolder',  async (req, res) => {
//     
//     const folderName = '/testfolder'

//     try {
//       if (!fs.existsSync(folderName)) {
//         fs.mkdirSync(folderName)
//       }
//     } catch (err) {
//       console.error(err)
//     }
// });




//#region upload image code

// Configure Storage
var storage = multer.diskStorage({

    // Setting directory on disk to save uploaded files
    destination: function (req, file, cb) {
        cb(null, '../BackEnd/Documents/childdata/' + req.query.id + '/');
        
    },

    // Setting name of file saved
    filename: function (req, file, cb) {
    let fname = file.originalname.substring(0,file.originalname.indexOf("."));
        cb(null, fname + req.query.date + '.' + fileExtension(file.originalname))
        
    }
})



var upload = multer({
    storage: storage,
    limits: {
        // Setting Image Size Limit to 2MBs
        fileSize: 2000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(pdf|jpg|tiff|eps|jpeg)$/)) {
            //Error
            cb(new Error('Supported file: pdf,jpg,jpeg,tiff,eps '))
            

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

var upload1 = multer({
    storage: storage,
    limits: {
        // Setting Image Size Limit to 2MBs
        fileSize: 2000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            //Error
         
            cb(new Error('Please upload JPG and PNG images only!'));
          
        }
        
        //Success
        cb(undefined, true)
    }
})


router.post('/uploadimage', upload1.single('uploadedImage'), (req, res, next) => {
    const file = req.file;
    
    let originalpath = "uploadedimages/" + file.filename;
    
    
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

//#endregion

//regChild
router.post('/regChild', async (req, res) => {
    try {
        const pool = await poolPromise;
        try {
            const recordset = await pool.request().input('poino', sql.Text, req.body.poino)
                .input('fname', sql.Text, req.body.fname)
                .input('lname', sql.Text, req.body.lname)
                .input('gender', sql.Int, req.body.gender)
                .input('dob', sql.DateTime, req.body.dob)
                .input('religion', sql.Int, req.body.religion)
                .input('schoolname', sql.Text, req.body.schoolname)
                .input('class', sql.Text, req.body.class)
                .input('schooladdress', sql.Text, req.body.schooladdress)
                .input('city', sql.Text, req.body.city)
                .input('residentialaddress', sql.Text, req.body.residentialaddress)
                .input('postaladdress', sql.Text, req.body.postaladdress)
                .input('pfname', sql.Text, req.body.pfname)
                .input('poccupation', sql.Text, req.body.poccupation)
                .input('pcnic', sql.Text, req.body.pcnic)
                .input('pcontact', sql.Text, req.body.pcontact)
                .input('mfname', sql.Text, req.body.mfname)
                .input('moccupation', sql.Text, req.body.moccupation)
                .input('mcnic', sql.Text, req.body.mcnic)
                .input('mcontact', sql.Text, req.body.mcontact)
                .input('gfname', sql.Text, req.body.gfname)
                .input('goccupation', sql.Text, req.body.goccupation)
                .input('gcnic', sql.Text, req.body.gcnic)
                .input('gcontact', sql.Text, req.body.gcontact)
                .input('firstconsent', sql.Bit, req.body.firstconsent)
                .input('secondconsent', sql.Bit, req.body.secondconsent)
                .input('thirdconsent', sql.Bit, req.body.thirdconsent)
                .input('hospitalname', sql.Int, req.body.HospitalName)
                .input('diabetestype', sql.Int, req.body.diabetestype)
                .input('doctorname', sql.Int, req.body.doctorname)
                .input('mdiadate', sql.DateTime, req.body.mdiadate)
                .input('mfamilydiabeteshitorytype', sql.Text, req.body.mfamilydiabeteshitorytype)
                .input('mglucompany', sql.Text, req.body.mglucompany)
                .input('compeye', sql.Int, req.body.compeye)
                .input('compfoot', sql.Int, req.body.compfoot)
                .input('compkidney', sql.Int, req.body.compkidney)
                .input('compcard', sql.Int, req.body.compcard)
                .input('compothers', sql.Int, req.body.compothers)
                .input('compno', sql.Int, req.body.compno)
                .input('medinfo', sql.Text, req.body.medinfo)
                .input('HbA1c', sql.Text, req.body.HbA1c)
                .input('HbA1ctestdate', sql.Text, req.body.HbA1ctestdate)
                .input('MicroAlbuminuria', sql.Text, req.body.MicroAlbuminuria)
                .input('MicroAlbuminuriatestdate', sql.Text, req.body.MicroAlbuminuriatestdate)
                .input('urineacr', sql.Text, req.body.urineacr)
                .input('urineacrtestdate', sql.Text, req.body.urineacrtestdate)
                .input('eyestest', sql.Text, req.body.eyestest)
                .input('eyestestdate', sql.Text, req.body.eyestestdate)
                .input('prespath', sql.Text, req.body.prespath)
                .input('billpath', sql.Text, req.body.billpath)
                .input('schoolpath', sql.Text, req.body.schoolpath)
                .input('cnicpath', sql.Text, req.body.cnicpath)
                .input('mcnicpath', sql.Text, req.body.mcnicpath)
                .input('gcnicpath', sql.Text, req.body.gcnicpath)
                .input('bfrompath', sql.Text, req.body.bfrompath)
                .input('imgpath', sql.Text, req.body.imgpath)
                .input('lfacsupport', sql.Int, req.body.lfacsupport)
                .execute('ChildRegistration');
            res.json(recordset.returnValue);
            
        } catch (queryErr) {
            res.status(406).send("Something went wrong  " + queryErr);
        }
    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});


//Register Referred Child

router.post('/regReferredChild', middleware.checkToken, async (req, res) => {
    const patientid = req.body.PatientId; //referral id \
    
    
    try {
        const pool = await poolPromise;
        try {
            const recordset = await pool.request().input('patientid', sql.Int, req.body.PatientId)
                .input('fname', sql.Text, req.body.FirstName)
                .input('lname', sql.Text, req.body.LastName)
                .input('guardian', sql.Text, req.body.GuardianName)
                .input('address', sql.Text, req.body.Address)
                .input('refferredby', sql.Text, req.body.ReferredBy)
                .input('city', sql.Int, req.body.City)
                .input('phoneno', sql.Text, req.body.PhoneNumberMobile)
                .input('comment',sql.Text,req.body.Comment)
                .output('reg',sql.Int)
                .execute('ChildReferralMovement')
            
            res.send([true,recordset.output.reg])
        } catch (queryErr) {
            res.status(406).send("Something went wrong" + queryErr)
        }

    } catch (err) {
        res.status(406).send(err.message);
    }

})

//updatechildreg
router.post('/updatechildreg', async (req, res) => {
    
    try {
        const pool = await poolPromise;
        try {
            const recordset = await pool.request().input('regnumber', sql.Int, req.body.regnumber)
                .input('fname', sql.Text, req.body.fname)
                .input('lname', sql.Text, req.body.lname)
                .input('gender', sql.Int, req.body.gender)
                .input('dob', sql.DateTime, req.body.dob)
                .input('religion', sql.Int, req.body.religion)
                .input('schoolname', sql.Text, req.body.schoolname)
                .input('class', sql.Text, req.body.class)
                .input('schooladdress', sql.Text, req.body.schooladdress)
                .input('city', sql.Text, req.body.city)
                .input('residentialaddress', sql.Text, req.body.residentialaddress)
                .input('postaladdress', sql.Text, req.body.postaladdress)
                .input('pfname', sql.Text, req.body.pfname)
                .input('poccupation', sql.Text, req.body.poccupation)
                .input('pcnic', sql.Text, req.body.pcnic)
                .input('pcontact', sql.Text, req.body.pcontact)
                .input('mfname', sql.Text, req.body.mfname)
                .input('moccupation', sql.Text, req.body.moccupation)
                .input('mcnic', sql.Text, req.body.mcnic)
                .input('mcontact', sql.Text, req.body.mcontact)
                .input('gfname', sql.Text, req.body.gfname)
                .input('goccupation', sql.Text, req.body.goccupation)
                .input('gcnic', sql.Text, req.body.gcnic)
                .input('gcontact', sql.Text, req.body.gcontact)
                .input('firstconsent', sql.Bit, req.body.firstconsent)
                .input('secondconsent', sql.Bit, req.body.secondconsent)
                .input('thirdconsent', sql.Bit, req.body.thirdconsent)
                .input('hospitalname', sql.Text, req.body.hospitalname)
                .input('diabetestype', sql.Text, req.body.diabetestype)
                .input('doctorname', sql.Text, req.body.doctorname)
                .input('mdiadate', sql.DateTime, req.body.mdiadate)
                .input('mfamilydiabeteshitorytype', sql.Text, req.body.mfamilydiabeteshitorytype)
                .input('mglucompany', sql.Text, req.body.mglucompany)
                .input('compeye', sql.Int, req.body.compeye)
                .input('compfoot', sql.Int, req.body.compfoot)
                .input('compkidney', sql.Int, req.body.compkidney)
                .input('compcard', sql.Int, req.body.compcard)
                .input('compothers', sql.Int, req.body.compothers)
                .input('compno', sql.Int, req.body.compno)
                .input('compnerve',sql.Int,req.body.compnerve)
                .input('medinfo', sql.Text, req.body.medinfo)
                .input('HbA1c', sql.Text, req.body.HbA1c)
                .input('HbA1ctestdate', sql.DateTime, req.body.HbA1ctestdate)
                .input('MicroAlbuminuria', sql.Text, req.body.MicroAlbuminuria)
                .input('MicroAlbuminuriatestdate', sql.DateTime, req.body.MicroAlbuminuriatestdate)
                .input('urineacr', sql.Text, req.body.urineacr)
                .input('urineacrtestdate', sql.DateTime, req.body.urineacrtestdate)
                .input('eyestest', sql.Text, req.body.eyestest)
                .input('eyestestdate', sql.DateTime, req.body.eyestestdate)
                .input('prespath', sql.Text, req.body.prespath)
                .input('billpath', sql.Text, req.body.billpath)
                .input('schoolpath', sql.Text, req.body.schoolpath)
                .input('cnicpath', sql.Text, req.body.cnicpath)
                .input('mcnicpath', sql.Text, req.body.mcnicpath)
                .input('gcnicpath', sql.Text, req.body.gcnicpath)
                .input('bfrompath', sql.Text, req.body.bfrompath)
                .input('imgpath', sql.Text, req.body.imgpath)
                .input('lfacsupport', sql.Int, req.body.lfacsupport)
                .input('poino', sql.Text, req.body.poino)
                .execute('UpdateChildRegistration');
            res.json(recordset.returnValue);
        } catch (queryErr) {
            res.status(406).send("Something went wrong  " + queryErr);
        }
    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});
router.post('/terminateReason', async (req, res) => {
    
    try {
        const pool = await poolPromise;
        try {
            const recordset = await pool.request()
                .input('comment', sql.Text, req.body.comment)
                .input('reason', sql.Text, req.body.reason)
                .input('tableName', sql.Text, req.body.tableName)
                .input('regnumber', sql.Int, req.body.RegNumber)
                .execute('RejectfromActive');
        if(recordset.returnValue)
            {res.send(true);}
        } catch (queryErr) {
            res.status(406).send("Something went wrong  " + queryErr);
        }
    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});
router.post('/passedAwayReason', async (req, res) => {
    
    try {
        const pool = await poolPromise;
        try {
            const recordset = await pool.request().input('dka', sql.Text, req.body.dka)
                .input('infection', sql.Text, req.body.infection)
                .input('complication', sql.Text, req.body.complication)
                .input('notrelated', sql.Text, req.body.notrelated)
                .input('SevereHypo', sql.Text, req.body.SevereHypo)
                .input('reason', sql.Text, req.body.reason)
                .input('tableName', sql.Text, req.body.tableName)
                .input('regnumber', sql.Int, req.body.RegNumber)
                .execute('PassedAwayReason');
        if(recordset.returnValue)
            {res.send(true);}
        } catch (queryErr) {
            res.status(406).send("Something went wrong  " + queryErr);
        }
    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});
router.post('/supendReason', async (req, res) => {
    
    try {
        const pool = await poolPromise;
        try {
            const recordset = await pool.request().input('Missingfollowup', sql.Text, req.body.Missingfollowup)
                .input('OutOfContact', sql.Text, req.body.OutOfContact)
                .input('reason', sql.Text, req.body.reason)
                .input('tableName', sql.Text, req.body.tableName)
                .input('regnumber', sql.Int, req.body.RegNumber)
                .execute('SuspendReason');
        if(recordset.returnValue)
            {res.send(true);}
        } catch (queryErr) {
            res.status(406).send("Something went wrong  " + queryErr);
        }
    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});
router.post('/rejectReason', async (req, res) => {
    
    try {
        const pool = await poolPromise;
        try {
            const recordset = await pool.request()
                .input('Comment', sql.Text, req.body.Comment)
                .input('reasonid', sql.Text, req.body.reasonid)
                .input('tableName', sql.Text, req.body.tableName)
                .input('regnumber', sql.Int, req.body.RegNumber)
                .execute('RejectfromDocs');
        if(recordset.returnValue)
            {res.send(true);}
        } catch (queryErr) {
            res.status(406).send("Something went wrong  " + queryErr);
        }
    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});
router.post('/graduateReason', async (req, res) => {
    
    try {
        const pool = await poolPromise;
        try {
            const recordset = await pool.request().input('Graduationineducation', sql.Text, req.body.Graduationineducation)
                .input('reason', sql.Text, req.body.reason)
                .input('tableName', sql.Text, req.body.tableName)
                .input('regnumber', sql.Int, req.body.RegNumber)
                .execute('GraduateReason');
        if(recordset.returnValue)
            {res.send(true);}
        } catch (queryErr) {
            res.status(406).send("Something went wrong  " + queryErr);
        }
    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});

//get edit Detail
router.get('/getdatabyid', async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "  select  poino,pi.RegNumber, pi.PatientFirstName , pi.LfacSupport,pi.PatientLastName , pi.ReligionEthnicity , pi.Gender , pi.City , pi.Class , convert(varchar, pi.DateofBirth,23) as DateofBirth ," +
        "pi.PatientPhoto , pi.SchoolName , pi.SchoolAddress , pi.ResidentialAddress , pi.PostalAddress , pi.CreatedDate , pi.FatherName , " +
        "pi.FatherContact , pi.FatherOccupation , pi.FatherCNIC , pi.FatherCNICPhoto , pi.MotherName , pi.MotherContact , pi.MotherOccupation , " +
        "pi.MotherCNIC , pi.MotherCNICPhoto ,pi.GuardianName , pi.GuardianContact , pi.GuardianOccupation , pi.GuardianCNIC , " +
        "pi.GuardianCNICPhoto , pi.PublicMedia , pi.SharingWithSponsors , pi.CaseStudies , pi.RegStatus , pi.Comments , pi.ReferredBy , " +
        "pi.PercentageSupport,convert(varchar, pm.DiagnosedDate,23) as DiagnosedDate  , pm.MedInfoId , pm.Hospital,pm.Doctor,pm.DiabetesType,pm.Glucometer,pm.FamilyHistoryDiabetesType , pm.HbA1c , CONVERT(varchar,pm.HbA1cDate,23) as HbA1cDate , pm.Microalb , " +
        "CONVERT(varchar,pm.MicroalbDate,23) as   MicroalbDate ,pm.UrineACR , CONVERT(varchar,pm.UrineACR1Date,23) as UrineACR1Date , pm.Eyestest , CONVERT(varchar,pm.EyestestDate,23) as  EyestestDate , pm.OtherMedicalInfo , pm.CompEye , pm.CompFoot ,pm.CompNo , " +
        " pm.CompNerve ,pm.CompKidney ,pm.CompCardio , pm.CompOther , pm.RegAuthSign , pm.PatientStatus , pm.Vaildatity , pm.ModifiedDate " +
        " ,doc.FirstName as DocFirstName, doc.LastName as DocLastName, hos.HospitalName as HosName,City.Name as CityName, Religion.CategoryName as RelName FROM  PatientInformation as pi left join PatientMedicalInformation as pm on pi.RegNumber=pm.RegNumber " +
        " left join City on pi.City=City.Id left join DoctorDetails as doc on pm.Doctor=Doc.DoctorId left join Hospital as Hos on pm.hospital=Hos.HospitalId left join Categories as Religion on pi.ReligionEthnicity=Religion.CategoryId where pi.RegNumber='" + req.query.id + "'";

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

router.get('/ChildReasonValueIdExist', async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "select FlagValues,ReasonId,Comment,ReasonTable,id" +
        " from DetailedReason where RegNumber='" + req.query.RegNumber + "' and ReasonTableId='"+req.query.tableid +"' ";

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

router.get('/getRegstatusbyid', async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "select poino,[RegStatus] from [PatientInformation] where RegNumber='" + req.query.id + "'";
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


router.get('/getlastid', async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = " select top(1) * from PatientInformation order by RegNumber desc";
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


router.get('/getpathdataby', async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = " select [DocType],[RegNumber] from DocumentsAttached";
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
//get edit Detail
router.get('/getpathdatabyid', async (req, res) => {
    try {
        const pool = await poolPromise;
        // let query = " select da.DocsId,da.ModifiedDate,da.DocLink,da.DocType,da.FilePath from DocumentsAttached as da " +

        //     " where da.RegNumber='" + req.query.id + "' ORDER BY da.ModifiedDate DESC";
        let query = "SELECT distinct(da.DocType),da.FilePath,da.DocLink FROM DocumentsAttached as da " +

            " WHERE da.RegNumber='" + req.query.id + "'";
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


//get Nisaab Form details
router.get('/getNisaabInfoById', async (req, res) => {
    try {
        const pool = await poolPromise;
        // let query = " select da.DocsId,da.ModifiedDate,da.DocLink,da.DocType,da.FilePath from DocumentsAttached as da " +

        //     " where da.RegNumber='" + req.query.id + "' ORDER BY da.ModifiedDate DESC";
        let query = "SELECT * FROM NisaabForm WHERE RegNumber ='" + req.query.id + "'";
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


router.get('/getallcities', async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "select Id,provinceID,DistrictID, UPPER(LEFT(Name,1))+LOWER(SUBSTRING(Name,2,LEN(Name))) Name,IUBy,IUDate from city ORDER BY city.Name ASC";
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


router.get('/getchildInfo', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        // let query = "SELECT ROW_NUMBER() OVER(Partition by RegNumber ORDER BY UpdateTime) AS priority,PatientFirstName+' '+isnull(PatientLastName,'') as pname, City,"+
        // " ResidentialAddress, "+
        // " convert (varchar,CreatedDate,103) as firstcontact, case when  FatherName is null  then GuardianName else FatherName end as GuardianName , FatherContact, "+
        //                 "  GuardianCNIC,  RegStatus, Comments, ReferredBy, convert (varchar,UpdateTime,103) as lastcontact, RegNumber, GuardianOccupation, GuardianContact "+
        // " from PatientInformation";
        let query = "Select * , convert(varchar,CreatedDate,106) as cdate, city.Name as CName  from ReferringPatientContact inner join city on city.Id=City ORDER BY CreatedDate desc"
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

router.get('/getchildInfobyId', middleware.checkToken, async (req, res) => {
    
    try {
        const pool = await poolPromise;
        // let query = "SELECT ROW_NUMBER() OVER(Partition by RegNumber ORDER BY UpdateTime) AS priority,PatientFirstName+' '+isnull(PatientLastName,'') as pname, City,"+
        // " ResidentialAddress, "+
        // " convert (varchar,CreatedDate,103) as firstcontact, case when  FatherName is null  then GuardianName else FatherName end as GuardianName , FatherContact, "+
        //                 "  GuardianCNIC,  RegStatus, Comments, ReferredBy, convert (varchar,UpdateTime,103) as lastcontact, RegNumber, GuardianOccupation, GuardianContact "+
        // " from PatientInformation";
        let query = "Select * from ReferringPatientContact  where PatientId='" + req.query.id + "'";

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



router.post('/updateRegstatus&Comment', async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "UPDATE PatientInformation SET RegStatus ='" + req.query.statusid + "' ,Comments ='" + req.query.comments + "' ,ActivateDate=getDate() WHERE RegNumber ='" + req.query.id + "'";
        
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
router.post('/IsArchive', async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "UPDATE PatientInformation SET IsArchive ='1' WHERE RegNumber ='" + req.query.id + "'";
        
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
router.post('/ReferedchildComment', async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "UPDATE ReferringPatientContact SET Comment = '"+ req.query.comments + "' WHERE PatientId = '" + req.query.id + "'";
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
router.post('/updateRegstatus', async (req, res) => {
    try {
        

        const pool = await poolPromise;
        let query = "UPDATE PatientInformation SET RegStatus ='" + req.query.statusid + "',UpdateTime= getDate()  ,Comments = 'Inactive by default' WHERE RegNumber ='" + req.query.id + "'";
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

router.get('/getchildReg', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        // let query = "SELECT ROW_NUMBER() OVER(Partition by RegNumber ORDER BY UpdateTime) AS priority,PatientFirstName+' '+isnull(PatientLastName,'') as pname, City,"+
        // " ResidentialAddress, "+
        // " convert (varchar,CreatedDate,103) as firstcontact, case when  FatherName is null  then GuardianName else FatherName end as GuardianName , FatherContact, "+
        //                 "  GuardianCNIC,  RegStatus, Comments, ReferredBy, convert (varchar,UpdateTime,103) as lastcontact, RegNumber, GuardianOccupation, GuardianContact "+
        // " from PatientInformation";
        // let query = "Select poino,[RegNumber] ,[PatientFirstName],convert(varchar, [ActivateDate], 107) as[ActivateDate],convert(varchar, [DeactivateDate], 107) as [DeactivateDate] ,[ReferredId],[PatientLastName] ,[ReligionEthnicity],[Gender] ,[City]," +
        //     " [Class],[DateofBirth] ,[PatientPhoto] ,[SchoolName] ,[SchoolAddress] ,[ResidentialAddress] ,[PostalAddress] , " +
        //     " convert( varchar,[CreatedDate],100)as CreatedDate ,[FatherName] ,[FatherContact] ,[FatherOccupation] ,[FatherCNIC] , " +
        //     " [FatherCNICPhoto] ,[MotherName]  ,[MotherContact]  ,[MotherOccupation]  ,[MotherCNIC]  ,[MotherCNICPhoto]  , " +
        //     " case when ( LTRIM(RTRIM([GuardianName])) = '' or GuardianName is null )then    case  when LTRIM(RTRIM(FatherName)) " +
        //     "  = '' then MotherName" +
        //     " else FatherName end  " +
        //     " else GuardianName end   as  GuardianName  ,case when ([GuardianContact] like '03' or GuardianContact is null ) " +
        //     " then case  when (FatherContact   like '03' or FatherContact is null) then MotherContact " +
        //     " else FatherContact end   else GuardianContact end   as  GuardianContact  ,[GuardianOccupation]  ,[GuardianCNIC]  ," +
        //     " [GuardianCNICPhoto]  ,[PublicMedia]  ,[SharingWithSponsors]  ,[CaseStudies], city.Name as Cname  ,[RegStatus]  , " +
        //     " [Comments]  ,[ReferredBy]  ,[PercentageSupport]  ,[Filepath] ,convert (varchar,[UpdateTime],100)as UpdateTime " +
        //     " from PatientInformation inner join city on  city.id = PatientInformation.City " +
        //     " left JOIN DetailedReason on PatientInformation.Regnumber=DetailedReason.regnumber	" +
        //     " order by RegNumber desc"
        let query =" Select poino,PatientInformation.[RegNumber] ,[PatientFirstName],convert(varchar, PatientInformation.ActivateDate, 107) as AD,convert(varchar, PatientInformation.DeactivateDate, 107) as DD ,[ReferredId],[PatientLastName] ,[ReligionEthnicity],[Gender] ,[City], "
        + " [Class],[DateofBirth] ,[PatientPhoto] ,[SchoolName] ,[SchoolAddress] ,[ResidentialAddress] ,[PostalAddress] ,         "
        + " convert( varchar,[CreatedDate],100)as CreatedDate ,[FatherName] ,[FatherContact] ,[FatherOccupation] ,[FatherCNIC] ,  "
        + " [FatherCNICPhoto] ,[MotherName]  ,[MotherContact]  ,[MotherOccupation]  ,[MotherCNIC]  ,[MotherCNICPhoto]  ,  		  "
        + " case when ( LTRIM(RTRIM([GuardianName])) = '' or GuardianName is null )then    case  when LTRIM(RTRIM(FatherName))    "
        + "  = '' then MotherName 																								  "
        + " else FatherName end   																								  "
        + " else GuardianName end   as  GuardianName  ,case when ([GuardianContact] like '03' or GuardianContact is null )  	  "
        + " then case  when (FatherContact   like '03' or FatherContact is null) then MotherContact  							  "
        + " else FatherContact end   else GuardianContact end   as  GuardianContact  ,[GuardianOccupation]  ,[GuardianCNIC]  , 	  "
        + " [GuardianCNICPhoto]  ,[PublicMedia]  ,[SharingWithSponsors]  ,[CaseStudies], city.Name as Cname  ,PatientInformation.[RegStatus]  ,  "
        + " [Comments]  ,[ReferredBy]  ,[PercentageSupport]  ,[Filepath] ,convert (varchar,[UpdateTime],107)as UpdateTime2  ,[UpdateTime],"
        + " DetailedReason.ReasonTable,DetailedReason.ReasonTableId,DetailedReason.FlagValues,DetailedReason.ReasonId,DetailedReason.Comment						"
        + " from PatientInformation inner join city on  city.id = PatientInformation.City  									"
        + " left JOIN DetailedReason on PatientInformation.Regnumber=DetailedReason.regnumber	where IsArchive != 1 OR IsArchive IS NULL 							"
        + " order by [UpdateTime]  desc"
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
router.get('/getchildRejected', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = 			 " Select poino,PatientInformation.[RegNumber] ,[PatientFirstName],convert(varchar, PatientInformation.[ActivateDate], 107) as ActivateDate,convert(varchar, PatientInformation.[DeactivateDate], 107) as DeactivateDate,[ReferredId],[PatientLastName] ,[ReligionEthnicity],[Gender] ,[City]," +
        " [Class],[DateofBirth] ,[PatientPhoto] ,[SchoolName] ,[SchoolAddress] ,[ResidentialAddress] ,[PostalAddress] , 																																			" +
        " convert( varchar,[CreatedDate],100)as CreatedDate ,[FatherName] ,[FatherContact] ,[FatherOccupation] ,[FatherCNIC] , 																																	" +
        " [FatherCNICPhoto] ,[MotherName]  ,[MotherContact]  ,[MotherOccupation]  ,[MotherCNIC]  ,[MotherCNICPhoto]  ,																																				" +
        " case when ( LTRIM(RTRIM(PatientInformation.GuardianName)) = '' or PatientInformation.GuardianName is null )then    case  when LTRIM(RTRIM(FatherName)) 																									" +
        "  = '' then MotherName																																																									" +
        " else FatherName end  																																																									" +
        " else GuardianName end   as  GuardianName  ,case when ([GuardianContact] like '03' or GuardianContact is null ) 																																			" +
        " then case  when (FatherContact   like '03' or FatherContact is null) then MotherContact 																																									" +
        " else FatherContact end   else GuardianContact end   as  GuardianContact  ,[GuardianOccupation]  ,[GuardianCNIC]  ,																																		" +
        " [GuardianCNICPhoto]  ,[PublicMedia]  ,[SharingWithSponsors]  ,[CaseStudies], city.Name as Cname  ,PatientInformation.[RegStatus]  ,																																			" +
        " [Comments]  ,[ReferredBy]  ,[PercentageSupport]  ,[Filepath] ,convert (varchar,[UpdateTime],107)as UpdateTime2 , [UpdateTime],																																			" +
        " DetailedReason.ReasonTable,DetailedReason.ReasonTableId,DetailedReason.FlagValues,DetailedReason.ReasonId,DetailedReason.Comment																																										" +
        " from PatientInformation																																																									" +
        " inner join city on  city.id = PatientInformation.City 																																																	" +
        " left JOIN DetailedReason on PatientInformation.Regnumber=DetailedReason.regnumber																																										" +
        " where PatientInformation.RegStatus >= 4 and PatientInformation.RegStatus!=5 and		PatientInformation.RegStatus!=7 and (IsArchive != 1 OR IsArchive IS NULL)	 Order by UpdateTime	desc																																																	" 
                                                                                                                                                                                                                                                                
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
router.get('/getByRegStatus', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "Select poino,[RegNumber] ,[PatientFirstName] ,[PatientLastName] ,[ReligionEthnicity],[Gender] ,[City],[Class], " +
            " [DateofBirth] ,[PatientPhoto] ,[SchoolName] ,[SchoolAddress] ,[ResidentialAddress] ,[PostalAddress] , " +
            " convert( varchar,[CreatedDate],100)as CreatedDate , " +
            " [FatherName] ,[FatherContact] ,[FatherOccupation] ,[FatherCNIC] ,[FatherCNICPhoto] ,[MotherName]  ," +
            " [MotherContact]  ,[MotherOccupation]  ,[MotherCNIC]  ,[MotherCNICPhoto]  ,case when ( LTRIM(RTRIM([GuardianName])) " +
            " = '' or GuardianName is null )then    case  when LTRIM(RTRIM(FatherName)) = '' then MotherName " +
            "else FatherName end  " +
            "else GuardianName end   as  GuardianName  ,case when ([GuardianContact] like '03' or GuardianContact is null ) " +
            " then case  when (FatherContact   like '03' or FatherContact is null) then MotherContact " +
            " else FatherContact end   else GuardianContact end   as  GuardianContact  ,[GuardianOccupation]  ,[GuardianCNIC]  , " +
            " [GuardianCNICPhoto]  ,[PublicMedia]  ,[SharingWithSponsors]  ,[CaseStudies], city.Name as Cname  ,[RegStatus]  , " +
            " [Comments]  ,[ReferredBy]  ,[PercentageSupport]  ,[Filepath] ,convert (varchar,[UpdateTime],107)as UpdateTime2, [UpdateTime]  " +
            " from PatientInformation inner join city on  city.id = PatientInformation.City  where Regstatus='" + req.query.status + "' order by UpdateTime desc"

        // let query = "Select * from PatientInformation where Regstatus='"+req.query.status+"'"
        

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


//deletechildreg
router.post('/deleteChildInfo', async (req, res) => {
    // 
    // 
    try {
        const pool = await poolPromise;
        try {
            
            const recordset = await pool.request().input('reg_no', sql.Int, req.body.reg_no)
                .input('user_id', sql.Int, req.body.user_id)
                .input('referredId', sql.Int, req.body.referredId)
                .execute('DeletChildInfo');
            
            // 
            res.json(recordset);
        } catch (queryErr) {
            
            res.status(406).send("Something went wrong  " + queryErr);
        }
    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});
router.post('/updateRegstatus&Comments', async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "UPDATE PatientInformation SET RegStatus ='" + req.query.statusid + "' ,Comments ='" + req.query.comments + "',DeactivateDate=getDate() , ActivateDate=getDate()  WHERE RegNumber ='" + req.query.id + "'";
        
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

// check already registered poi no

router.get('/getchildpoi', middleware.checkToken, async (req, res) => {
    
    try {
        const pool = await poolPromise;
    
        let query = "Select count(*) as poi from PatientInformation where poino ='" +req.query.poi+"'";

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



//#endregion
module.exports = router;