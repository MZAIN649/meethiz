//#region Declaration
const {
    poolPromise
} = require('../../database/db');
const {
    sql
} = require('../../database/db');

//#endregion
module.exports = {
    executeDuplicateQuery: async function executeDuplicateQuery(query) {
        return new Promise(async (resolve, reject) => {
            try {
                const pool = await poolPromise;
                await pool.request().query(query);
                resolve(true);
            } catch (err) {
                if (err.number == "2601") {
                    reject("Duplicate");
                } else
                    reject(err);
            }
        });
    },
    executeSelectQuery: async function executeSelectQuery(query) {
        return new Promise(async (resolve, reject) => {
            try {
                const pool = await poolPromise;
                const recordset = await pool.request().query(query);
                if (recordset) {
                    resolve(recordset.recordset);
                }
            } catch (err) {
                reject(err);
            }
        });
    },
    executeDeleteQuery: async function executeDeleteQuery(query) {
        return new Promise(async (resolve, reject) => {
            try {
                const pool = await poolPromise;
                await pool.request().query(query);
                resolve(true);
            } catch (err) {
                reject(false);
            }
        });
    },
    executeSelectQueryTrue: async function executeSelectQueryTrue(query) {
        return new Promise(async (resolve, reject) => {
            try {
                const pool = await poolPromise;
                const recordset = await pool.request().query(query);
                
                if (recordset.recordset.length == 0) {
                    resolve(false);
                } else {
                    reject(true);
                }
            } catch (err) {
                reject(false);
            }
        });
    },
}