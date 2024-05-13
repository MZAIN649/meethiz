let express = require('express');
let router = express.Router();
var sql = require('mssql/msnodesqlv8');
var nodemailer = require('nodemailer');
var bodyParser = require('body-parser');
let middleware = require('../middleware');
const { poolPromise } = require('../database/db');
const { json } = require('body-parser');
router.post('/addNisab', async (req, res) => {
    
    try {
        const pool = await poolPromise;
        let query = "insert into NisaabForm ([JobIncome],[Rentliability],[TransportValue],[Gold],[Silver],[SBIncome],[Savings],[DebtAmount],[LoanAmount],[MonthlyExpense],[Liabilities],[Difference],[Assets],[RegNumber],[NisabYear],[EligibilityStatus],[CreatedDate]) values( '" + req.body.JobIncome + "','" + req.body.Rentliability + "','" + req.body.TransportValue + "','" +
        req.body.Gold + "','" + req.body.Silver + "','" + req.body.SBIncome + "','" +
        req.body.Savings + "','" + req.body.DebtAmount + "','" + req.body.LoanAmount + "','" +
        req.body.MonthlyExpense  + "','" +req.body.Totalliabilities + "','" + req.body.Difference + "','" +
        req.body.Totalassets + "','" + req.body.PatientRegNumber + "','" + req.body.NisabYear + "','" + 
        req.body.Iseligiable + "','" + 
        req.body.CreatedDate + "' )";
        
        try {
            const recordset = await pool.request().query(query);
            
            if (recordset) {
                res.send(true);     
            }
            else {
                res.send(err.message);
                
            }
        }
        catch (queryErr) {
            
            
            if(queryErr.number==2601){
                res.json("duplicate")
            }
            else{
                res.json("something went wrong");
            }
            return;
            //res.status(406).send("Something went wrong  " + queryErr);
            //return;
        }
    }
    catch (err) {
        res.status(406)
        res.send(err.message)
    }
});
router.post('/UpdateNisab', async (req, res) => {
    
    try {
        const pool = await poolPromise;
        let query = "update NisaabForm set JobIncome = '" + req.body.JobIncome + "',Rentliability = '" + req.body.Rentliability + "', TransportValue = '" + req.body.TransportValue + "', Gold ='" +
        req.body.Gold + "', Silver = '" + req.body.Silver + "', SBIncome ='" + req.body.SBIncome + "', Savings ='" +
        req.body.Savings + "', DebtAmount ='" + req.body.DebtAmount + "', LoanAmount ='" + req.body.LoanAmount + "', MonthlyExpense ='" +
        req.body.MonthlyExpense + "',Liabilities ='" +req.body.Totalliabilities + "',Assets = '" + 
        req.body.Totalassets +  "',NisabYear='" + req.body.NisabYear + "',EligibilityStatus= '" + 
        req.body.Iseligiable + "',CreatedDate ='" + req.body.CreatedDate + "',Difference ='" +
        req.body.Difference +  "'where NisabYear= '" + req.body.NisabYear + "'and NisaabId ='"+ req.body.NisaabId + "'";
        
        try {
            const recordset = await pool.request().query(query);
            
            if (recordset) {
                res.send(true);     
            }
            else {
                res.send(err.message);
                
            }
        }
        catch (queryErr) {
            
            
            if(queryErr.number==2601){
                res.json("duplicate")
            }
            else{
                res.json("something went wrong" + queryErr);
            }
            return;
            //res.status(406).send("Something went wrong  " + queryErr);
            //return;
        }
    }
    catch (err) {
        res.status(406)
        res.send(err.message)
    }
});
router.post('/UpdateNisabValue', async (req, res) => {
    
    try {
        const pool = await poolPromise;
        let query = "update NisabYear set NisabAmount = '" + req.body.NisabValue + "' where HijriYear ='" + req.body.HijriYear  + "'";
        
        try {
            const recordset = await pool.request().query(query);
            
            if (recordset) {
                res.send(true);     
            }
            else {
                res.send(err.message);
                
            }
        }
        catch (queryErr) {
            
            
            if(queryErr.number==2601){
                res.json("duplicate")
            }
            else{
                res.json("something went wrong" + queryErr);
            }
            return;
            //res.status(406).send("Something went wrong  " + queryErr);
            //return;
        }
    }
    catch (err) {
        res.status(406)
        res.send(err.message)
    }
});
router.get('/getAllPatient', async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "select * from PatientInformation where RegNumber NOT IN (Select RegNumber from NisaabForm where NisabYear >= RIGHT(convert(varchar(10),getdate(),131),4))";
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
router.get('/getAllRegPatient', async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "select * from PatientInformation where RegNumber  NOT IN (Select RegNumber from NisaabForm where NisabYear >= RIGHT(convert(varchar(10),getdate(),131),4)) and ReligionEthnicity > 0" ;
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
router.get('/getAllPatientNisab', async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "select PatientInformation.PoiNo,PatientInformation.RegNumber,PatientInformation.ReligionEthnicity, PatientFirstName, PatientLastName , NisaabForm.NisaabId, NisaabForm.NisabYear, "+
        "NisaabForm.Assets,NisaabForm.Difference, NisaabForm.Liabilities, NisaabForm.EligibilityStatus, "+
        "NisaabForm.JobIncome,NisaabForm.Gold,NisaabForm.Silver,NisaabForm.SBIncome,convert(varchar,NisaabForm.CreatedDate,0)CreatedDate , "+
        "NisaabForm.DebtAmount,NisaabForm.MonthlyExpense,NisaabForm.LoanAmount,NisaabForm.Rentliability, "+
        "NisaabForm.Savings,NisaabForm.TransportValue, Categories.CategoryName as status  from PatientInformation  inner join NisaabForm on "+
        "PatientInformation.RegNumber = NisaabForm.RegNumber inner join Categories on NisaabForm.EligibilityStatus = Categories.CategoryId";
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
router.get('/getNisabByID', async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "select PatientInformation.PoiNo ,PatientInformation.PatientFirstName, PatientInformation.PatientLastName,PatientInformation.ReligionEthnicity ,NisaabForm.RegNumber, "+
        "NisaabForm.JobIncome ,  NisaabForm.TransportValue, NisaabForm.Gold,NisaabForm.Silver,NisaabForm.SBIncome,NisaabForm.Savings,NisaabForm.LoanAmount, "+
        "Categories.CategoryName as Estatus, Rel.CategoryName as ReligionName,NisaabForm.DebtAmount,NisaabForm.EligibilityStatus,NisaabForm.Rentliability,NisaabForm.MonthlyExpense,NisaabForm.Assets,NisaabForm.Liabilities,NisaabForm.Difference,NisaabForm.NisabYear "+
        "from PatientInformation  inner join NisaabForm on PatientInformation.RegNumber = NisaabForm.RegNumber inner join Categories on NisaabForm.EligibilityStatus = Categories.CategoryId inner join Categories as Rel on PatientInformation.ReligionEthnicity = Rel.CategoryId where NisaabId ='"+req.query.NisabId + "'";
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

router.get('/GetPatientNisab', async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "select NisaabForm.* ,Categories.CategoryName as status,PatientInformation.PatientFirstName,PatientInformation.PatientLastName  from NisaabForm inner join PatientInformation on PatientInformation.RegNumber = NisaabForm.RegNumber inner join Categories on NisaabForm.EligibilityStatus = Categories.CategoryId where NisaabForm.RegNumber ='"+ req.query.RegNo + "'";
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
router.get('/getPatientByRegNo', async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "Select * from PatientInformation where RegNumber='"+ req.query.RegNo + "'";
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
router.get('/deleteNisab', middleware.checkToken, async (req, res) => {
    

    // Check if exist in other tables as foreign keys //
    const pool = await poolPromise;
    // let query = "SELECT COUNT(ItemId) as AssignItemVendor_items  from AssignItemVendor where ItemId='" + req.query.id + "' UNION SELECT COUNT(itemId) as packages_sub_items FROM packagessub where itemId='" + req.query.id + "' UNION SELECT COUNT(ItemId) as PurchasedOrderSub_items FROM PurchasedOrderSub where ItemId='" + req.query.id + "' ";
    let query = "DELETE FROM NisaabForm WHERE NisaabID = '" + req.query.id + "'"
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
router.get('/getNisab', async (req, res) => {
    
     // Check if exist in other tables as foreign keys //
    
     // let query = "SELECT COUNT(ItemId) as AssignItemVendor_items  from AssignItemVendor where ItemId='" + req.query.id + "' UNION SELECT COUNT(itemId) as packages_sub_items FROM packagessub where itemId='" + req.query.id + "' UNION SELECT COUNT(ItemId) as PurchasedOrderSub_items FROM PurchasedOrderSub where ItemId='" + req.query.id + "' ";
      
    try {
            const pool = await poolPromise;
            let query = "select HijriYear, GregorianYear, NisabAmount as Nisab from NisabYear where HijriYear= RIGHT(convert(varchar(10),getdate(),131),4)";
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
    router.get('/getallyearNisab', async (req, res) => {
        try {
            const pool = await poolPromise;
            let query = "select HijriYear, GregorianYear, NisabAmount as Nisab from NisabYear";
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
module.exports = router;   
