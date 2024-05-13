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
const saltRounds = 10;
const {
    poolPromise
} = require('../database/db');
const {
    json
} = require('body-parser');
const path = require('path');

//#region upload image code

//directory code
router.get('/addfolder', function (req, res) {
    
    
    
    
    fs.mkdir(path.join('./Documents/doctordata/', req.query.id), {
        recursive: true
    }, (err) => {
        if (err) {
            return console.error(err);
        }
        
    });

});


// Configure Storage
var storage = multer.diskStorage({

    // Setting directory on disk to save uploaded files
    destination: function (req, file, cb) {
        cb(null, '../BackEnd/Documents/doctordata/' + req.query.id + '/');
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
        if (!file.originalname.match(/\.(jpg|jpeg|png|eps|tiff)$/)) {
            //Error
            cb(new Error('Please upload JPG,JPEG,EPS,TIFF and PNG images only!'))
        }
        //Success
        cb(undefined, true)
    }
});

router.post('/uploadfile', upload.single('uploadedImage'), (req, res, next) => {
    const file = req.file;
    console.log(file.filename)
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



router.post('/doctorRegister', async (req, res) => {
    try {
        
        const pool = await poolPromise;
        let query = "Insert into DoctorDetails (FirstName,LastName,PhoneNumberWork,PhoneNumberMobile,DepartmentName,Designation,City,[Address],WebsiteSocial "
            +",EmailAddress,NumberOfReferredChildren,DoctorPhoto , InfoShareWithPeople , InfoShareWithDoctors , InfoShareOnSocialMedia , AssistRegProcess , "
            +"FreeConsultation , PackageHandling , ReferOtherDoctor,SupportSupplies,NewCases,EligibleInsulinSupport,PercentageSupport,[Date],[Signature],Organization,isArchive) Values  ('" + req.body.fname + "' ,'" + req.body.lname + "','" + req.body.telno + "','" + req.body.cellno + "','" + req.body.depname + "','" + req.body.designation + "','" + req.body.city + "','" + req.body.address + "','" + req.body.Website + "','" + req.body.email + "','" + req.body.tdiabchildren + "','" + req.body.uploadedImage + "','" + req.body.firstconsent + "','" + req.body.secondconsent + "','" + req.body.thirdconsent + "','" + req.body.fourthconsent + "','" + req.body.fifthconsent + "','" + req.body.sixthconsent + "','" + req.body.seventhconsent + "','" + req.body.eightconsent + "','" + req.body.newcasespermonth + "','" + req.body.insulinsupport + "','" + req.body.support + "','" + req.body.Date + "','" + req.body.signature + "','" + req.body.hospital + "' , 0)  select IDENT_CURRENT('DoctorDetails') as DoctorId;";
        
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
router.post('/doctorSignUp', async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "select * from [dbo].[User]  where Email='" + req.body.email + "'";
        const recordset = await pool.request().query(query);
        try {
            if (recordset.recordset.length) {
                //
                res.send(false);
            } else {
                /** Ecrypt password */
                console.log(req.body.password)
                bcrypt.genSalt(10, function (err, salt) {
                    bcrypt.hash(req.body.password, salt, async (err, encrypted) => {
                        try {
                            const q = await pool.request()
                            .input('FirstName', sql.Text, req.body.fname)
                            .input('LastName', sql.Text, req.body.lname)
                            .input('PhoneNumberWork', sql.Text, req.body.telno)
                            .input('PhoneNumberMobile', sql.Text, req.body.cellno)
                            .input('DepartmentName', sql.Text, req.body.depname)
                            .input('Designation', sql.Text, req.body.designation)
                            .input('City', sql.Int, req.body.city)
                            .input('Address', sql.Text, req.body.address)
                            .input('WebsiteSocial', sql.Text, req.body.Website)
                            .input('EmailAddress', sql.Text, req.body.email)
                            .input('NumberOfReferredChildren', sql.Int, req.body.tdiabchildren)
                            .input('DoctorPhoto', sql.Text, req.body.uploadedImage)
                            .input('InfoShareWithPeople', sql.Bit, req.body.firstconsent)
                            .input('InfoShareWithDoctors', sql.Bit, req.body.secondconsent)
                            .input('InfoShareOnSocialMedia', sql.Bit, req.body.thirdconsent)
                            .input('AssistRegProcess', sql.Bit, req.body.fourthconsent)
                            .input('FreeConsultation', sql.Bit, req.body.fifthconsent)
                            .input('PackageHandling', sql.Bit, req.body.sixthconsent)
                            .input('ReferOtherDoctor', sql.Bit, req.body.seventhconsent)
                            .input('SupportSupplies', sql.Bit, req.body.eighthconsent)
                            .input('NewCases', sql.Int, req.body.newcasespermonth)
                            .input('EligibleInsulinSupport', sql.Int, req.body.insulinsupport)
                            .input('PercentageSupport', sql.Int, req.body.support)
                            .input('Date', sql.Date, req.body.Date)
                            .input('Signature', sql.Text, req.body.signature)
                            .input('Organization', sql.Int, req.body.hospital)
                            .input('isArchive', sql.Int,1)
                            .input('Password',sql.Text,encrypted)
                            .execute('DoctorSignUp');
                          res.status(200).send(q.recordset);
                         
                        } catch (e) {
                            res.status(406).send("Error in Registering User"+e);
                        }
                        
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

router.post('/updatingUserIdOfDoctor', async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "Update DoctorDetails SET UserId = '" + req.body.UserId +"' "        
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
router.post('/updateRecord', async (req, res) => {
    try {
        
        const pool = await poolPromise;
        let query = "update DoctorDetails set FirstName = '" + req.body.fname + "',LastName= '" + req.body.lname + "',PhoneNumberWork= '" + req.body.telno + "',PhoneNumberMobile= '" + req.body.cellno + "',DepartmentName= '" + req.body.depname + "',Designation= '" + req.body.designation + "',City= '" + req.body.city + "',Address= '" + req.body.address + "',WebsiteSocial= '" + req.body.website + "',EmailAddress= '" + req.body.email + "',NumberOfReferredChildren= '" + req.body.tdiabchildren + "',DoctorPhoto = '" + req.body.uploadedImage + "', InfoShareWithPeople = '" + req.body.firstconsent + "', InfoShareWithDoctors = '" + req.body.secondconsent + "', InfoShareOnSocialMedia = '" + req.body.thirdconsent + "', AssistRegProcess = '" + req.body.fourthconsent + "', FreeConsultation = '" + req.body.fifthconsent + "', PackageHandling = '" + req.body.sixthconsent + "', ReferOtherDoctor= '" + req.body.seventhconsent + "',SupportSupplies= '" + req.body.eightconsent + "',NewCases= '" + req.body.newcasespermonth + "',EligibleInsulinSupport= '" + req.body.insulinsupport + "',PercentageSupport= '" + req.body.support + "',[Date] = '" + req.body.Date + "',[Signature]= '" + req.body.signature + "',Organization= '" + req.body.hospital + "' where DoctorId= '" + req.body.id + "'";
        
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



router.get('/getdatabyId', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = " SELECT DoctorId  ,  FirstName  ,  LastName  ,  PhoneNumberWork  ,  PhoneNumberMobile  ,  DepartmentName  " +
            " ,  Designation  ,  City  ,  Address  ,  WebsiteSocial  ,  EmailAddress  ,  NumberOfReferredChildren  ,  UserId  " +
            " ,  IsActive  ,  ModifiedDate  ,  DoctorPhoto  ,  InfoShareWithPeople  ,  InfoShareWithDoctors  ,  InfoShareOnSocialMedia  , " +
            " AssistRegProcess  ,  FreeConsultation  ,  PackageHandling  ,  ReferOtherDoctor  ,  SupportSupplies  ,  PercentageSupport  ,  " +
            " convert(varchar, Date ,23) as Date ,  EligibleInsulinSupport  ,  NewCases  ,  Signature  ,  Organization  " +
            "  FROM   DoctorDetails  where DoctorId='" + req.query.id + "'";
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
router.get('/doctorCheck', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "select EmployeeId from [user] where Userid ='"+req.query.id+"' ";
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
router.get('/getchildreferralbyid2', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
                let query = "select  poino,pi.RegNumber, pi.PatientFirstName , pi.LfacSupport,pi.PatientLastName , pi.ReligionEthnicity , pi.Gender , pi.City , pi.Class , convert(varchar, pi.DateofBirth,23) as DateofBirth , pi.PatientPhoto , pi.SchoolName , pi.SchoolAddress , pi.ResidentialAddress , pi.PostalAddress , pi.CreatedDate , pi.FatherName ,  pi.FatherContact , pi.FatherOccupation , pi.FatherCNIC , pi.FatherCNICPhoto , pi.MotherName , pi.MotherContact , pi.MotherOccupation ,  pi.MotherCNIC , pi.MotherCNICPhoto ,pi.GuardianName , pi.GuardianContact , pi.GuardianOccupation , pi.GuardianCNIC ,  pi.GuardianCNICPhoto , pi.PublicMedia , pi.SharingWithSponsors , pi.CaseStudies , pi.RegStatus , pi.Comments , pi.ReferredBy ,  pi.PercentageSupport,convert(varchar, pm.DiagnosedDate,23) as DiagnosedDate  , pm.MedInfoId , pm.Hospital,pm.Doctor,pm.DiabetesType,pm.Glucometer,pm.FamilyHistoryDiabetesType , pm.HbA1c , CONVERT(varchar,pm.HbA1cDate,23) as HbA1cDate , pm.Microalb ,   CONVERT(varchar,pm.MicroalbDate,23) as   MicroalbDate ,pm.UrineACR , CONVERT(varchar,pm.UrineACR1Date,23) as UrineACR1Date , pm.Eyestest , CONVERT(varchar,pm.EyestestDate,23) as  EyestestDate , pm.OtherMedicalInfo , pm.CompEye , pm.CompFoot ,pm.CompNo ,  pm.CompNerve ,pm.CompKidney ,pm.CompCardio , pm.CompOther , pm.RegAuthSign , pm.PatientStatus , pm.Vaildatity , pm.ModifiedDate  ,doc.FirstName as DocFirstName, doc.LastName as DocLastName, doc.DoctorId, pm.Doctor, hos.HospitalName as HosName,City.Name as CityName, Religion.CategoryName as RelName FROM  PatientInformation as pi left join PatientMedicalInformation as pm on pi.RegNumber=pm.RegNumber left join City on pi.City=City.Id left join DoctorDetails as doc on pm.Doctor=Doc.DoctorId left join Hospital as Hos on pm.hospital=Hos.HospitalId left join Categories as Religion on pi.ReligionEthnicity=Religion.CategoryId  where pm.Doctor ='"+req.query.id+"' "
                    try {
                        
                        const recordset = await pool.request().query(query);
                       
                        if (recordset) {
                          res.send(recordset.recordset)
                        }
                        else{
                            res.send([]);
                        }
                    } catch (error) {
                        res.status(406).send("Something went wrong  " + queryErr);
                    }
   
    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});
router.get('/getchildreferralbyid', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "select EmployeeId from [User] where Userid ='"+req.query.id+"' ";
        try {
            const recordset = await pool.request().query(query);
            if (recordset) {
                const doctorId=recordset.recordset[0].EmployeeId;
                let query = "select * from ReferringPatientContact "
                +"inner join city on city.Id=ReferringPatientContact.City "
                +"where ReferringPatientContact.ReferredBy ='"+doctorId+"' ";
                    try {
                        const recordset = await pool.request().query(query);
                        if (recordset) {
                          res.send(recordset.recordset)
                        }
                        else{
                            res.send([]);
                        }
                    } catch (error) {
                        res.status(406).send("Something went wrong  " + queryErr);
                    }

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
router.get('/doctorbyId', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "select FirstName ,LastName, EmployeeId as DoctorId from [User] where Userid ='"+req.query.id+"' ";
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

router.get('/inactivate', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = " update DoctorDetails set isArchive=0 where DoctorId= '" + req.query.id + "'";
        try {
            const recordset = await pool.request().query(query);
            if (recordset) {
                res.send(true);
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

router.get('/activate', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = " update DoctorDetails set isArchive=1 where DoctorId= '" + req.query.id + "'";
        try {
            const recordset = await pool.request().query(query);
            if (recordset) {
                res.send(true);
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

router.get('/getAllActiveData', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = 
        " SELECT        DoctorDetails.DoctorId, DoctorDetails.FirstName, DoctorDetails.LastName, DoctorDetails.PhoneNumberWork, DoctorDetails.PhoneNumberMobile, DoctorDetails.DepartmentName, DoctorDetails.Designation, City.Name as City, "+
        "               DoctorDetails.Address, DoctorDetails.IsActive, DoctorDetails.PercentageSupport, DoctorDetails.Date, DoctorDetails.Organization, "+
        "               DoctorDetails.isArchive, Hospital.HospitalId, Hospital.HospitalName "+
        " FROM          DoctorDetails Left JOIN "+
        "               Hospital ON Hospital.HospitalId = DoctorDetails.Organization"+
        "               Inner Join City on doctordetails.city = City.id"+
        " Where         DoctorDetails.isArchive=1 "+
        " ORDER BY DoctorDetails.ModifiedDate DESC, DoctorDetails.DoctorId DESC ";
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

router.get('/getAllInActiveData', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        // let query = "select * from DoctorDetails where isArchive=0 order by ModifiedDate desc,DoctorId desc";
        let query =" SELECT        DoctorDetails.DoctorId, DoctorDetails.FirstName, DoctorDetails.LastName, DoctorDetails.PhoneNumberWork, DoctorDetails.PhoneNumberMobile, DoctorDetails.DepartmentName, DoctorDetails.Designation, City.Name as City, "+
        "               DoctorDetails.Address, DoctorDetails.IsActive, DoctorDetails.PercentageSupport, DoctorDetails.Date, DoctorDetails.Organization, "+
        "               DoctorDetails.isArchive, Hospital.HospitalId, Hospital.HospitalName "+
        " FROM          DoctorDetails Left JOIN "+
        "               Hospital ON Hospital.HospitalId = DoctorDetails.Organization"+
        "               Inner Join City on doctordetails.city = City.id"+
        " Where         DoctorDetails.isArchive=0 "+
        " ORDER BY DoctorDetails.ModifiedDate DESC, DoctorDetails.DoctorId DESC ";
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


router.get('/deletePendingDoctor', middleware.checkToken, async (req, res) => {
    

    // Check if exist in other tables as foreign keys //
    const pool = await poolPromise;
    // let query = "SELECT COUNT(ItemId) as AssignItemVendor_items  from AssignItemVendor where ItemId='" + req.query.id + "' UNION SELECT COUNT(itemId) as packages_sub_items FROM packagessub where itemId='" + req.query.id + "' UNION SELECT COUNT(ItemId) as PurchasedOrderSub_items FROM PurchasedOrderSub where ItemId='" + req.query.id + "' ";
    let query = "SELECT 'ReferringPatientContact' as rowname,  COUNT(*) as count from ReferringPatientContact where ReferredBy = '" + req.query.id + "' UNION " +
        " SELECT 'PatientInformation' as rowname, COUNT(*) as count from PatientInformation where ReferredBy = '" + req.query.id + "'";
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
});


router.get('/deleteDoctor', middleware.checkToken, async (req, res) => {
    

    // Check if exist in other tables as foreign keys //
    const pool = await poolPromise;
    // let query = "SELECT COUNT(ItemId) as AssignItemVendor_items  from AssignItemVendor where ItemId='" + req.query.id + "' UNION SELECT COUNT(itemId) as packages_sub_items FROM packagessub where itemId='" + req.query.id + "' UNION SELECT COUNT(ItemId) as PurchasedOrderSub_items FROM PurchasedOrderSub where ItemId='" + req.query.id + "' ";
    let query = "DELETE FROM DoctorDetails WHERE DoctorId = '" + req.query.id + "'";
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
});
//#endregion

//#endregion
module.exports = router;