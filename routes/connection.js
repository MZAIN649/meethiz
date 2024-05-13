var sql         =       require('mssql/msnodesqlv8');

//require('dotenv').config();

// var config = {

//     connectionString: 'Driver=SQL Server;Server=DESKTOP-EOH8RK7\\SQLEXPRESS;Database=IOTDB;Trusted_Connection=true;'
// };

const config    =   {

    user            :   'sa',

    password        :   '12345',

    // server: '172.17.85.12,1433', // You can use 'localhost\\instance' to connect to named instance
    server          :   'DESKTOP-93K1MBU\\SQLEXPRESS',

    
    // You can use 'localhost\\instance' to connect to named instance
    database        :   'MeethiZindagi'

}

    sql.connect(config, function (err) {

    if (err)

    {
        

        return;

    } 

    

});


module.exports      =       config;