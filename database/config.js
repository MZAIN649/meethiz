require('dotenv').config();
module.exports = {
     user: 'asifshir_mzuser',
   password: '5sxuwpivqabfzmjlhcgk',
   server: '198.38.83.33',
   database: 'asifshir_mzdb',
 
    //  user: 'sa',
    //  password: '12345',
    //  server: '172.17.85.23',
    //  database: 'oldmdb',
    
    // user: 'sa',
    // password: '12345',
    // server: "DESKTOP-T5BO93F\\SQLEXPRESS",
    // database: "asifshir_mzdb",
   
    options: {
      
        encrypt: false,
        trustedConnection: true,
        enableArithAbort: true,
    },
    pool: {
        max: process.env.DB_MAX_POOL || 500,
        min: 0,
    },

    // user: 'sa',
    // password: '12345',
    // server:"192.192.192.28",
    // database: 'MeethiZindagi23nov',

};