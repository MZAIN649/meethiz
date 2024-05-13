//#region
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


router.post('/addEntity', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "insert into dbo.EntityType ([EntityName]) values ('" +
            req.body.EntityName + "')";

        try {
            const recordset = await pool.request().query(query);
            if (recordset) {
                res.send(true);

            } else {
                res.send([]);
            }
        } catch (queryErr) {
            if (queryErr.number == 2601) {
                res.send(false);
            } else {
                res.status(406).send("Something went wrong  " + queryErr);
                return;
            }
        }
    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});
router.post('/editEntity', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "update dbo.EntityType set EntityName = '" +
            req.body.EntityName + "' where EntityTypeId='" + req.body.EntityTypeId + "'";

        try {
            const recordset = await pool.request().query(query);
            if (recordset) {
                res.send(true);

            } else {
                res.send([]);
            }
        } catch (queryErr) {
            if (queryErr.number == 2601) {
                res.send(false);
            } else {
                res.status(406).send("Something went wrong  " + queryErr);
                return;
            }
        }
    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});

router.post('/editCategory', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "update dbo.Categories set CategoryName = '" +
            req.body.CategoryName + "' , EntityTypeId='" + req.body.EntityTypeId + "' , PRI='" + req.body.priority + "' where categoryid='" + req.body.CategoryId + "'";

        try {
            const recordset = await pool.request().query(query);
            if (recordset) {
                res.send(true);

            } else {
                res.send([]);
            }
        } catch (queryErr) {
            if (queryErr.number == 2601) {
                res.send(false);
            } else {
                res.status(406).send("Something went wrong  " + queryErr);
                return;
            }
        }
    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});

router.post('/addCategory', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "insert into dbo.Categories ([CategoryName],[EntityTypeId],[PRI])  values ('" +
            req.body.CategoryName + "'," + req.body.EntityTypeId + ",'" + req.body.priority + "')";

        try {
            const recordset = await pool.request().query(query);
            if (recordset) {
                res.send(true);

            } else {
                res.send([]);
            }
        } catch (queryErr) {
            
            if (queryErr.number == 2601) {
                res.send(false);
            } else {
                res.status(406).send("Something went wrong  " + queryErr);
                return;
            }
        }
    } catch (err) {
        res.status(406)
        res.send(err.message)
    }
});

router.get('/deleteCategory', middleware.checkToken, async (req, res) => {
    

    const pool = await poolPromise;
    let query = "DELETE FROM Categories WHERE CategoryId = '" + req.query.CategoryId + "'";
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
router.get('/getAllEntities', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "select * from EntityType";
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

router.get('/getAllHospitals', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "select * from Categories where EntityTypeId = 1226";
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

router.get('/getAllCategories', middleware.checkToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "select * from Categories inner join EntityType on Categories.EntityTypeId=EntityType.EntityTypeId";
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
router.get('/getEntitybyid', async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "select * from EntityType where EntityTypeId='" + req.query.EntityTypeId + "'";
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
router.post('/deleteEntity', async (req, res) => {
    // 
    // 
    try {
        const pool = await poolPromise;
        try {
            
            const recordset = await pool.request()
                .input('user_id', sql.Int, req.body.CurrentUserId)
                .input('EntityTypeId', sql.Int, req.body.EntityTypeId)
                .execute('DeleteEntityType');
            
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

router.get('/getCategorybyid', async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "select * from Categories where CategoryId='" + req.query.CategoryId + "'";
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
router.get('/getCategorybyEntityType', async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = "select * from Categories where EntityTypeId='" + req.query.EntityTypeId + "' order by [PRI] ASC";
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