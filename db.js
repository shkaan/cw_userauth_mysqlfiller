var knex = require('knex')({
    client: "mysql",

    //set to use env variable for connection in format: mysql://username:password@host:port/database
    connection: process.env.JAWSDB_URL || process.env.mysql_url,
    //or old fashioned hardcoded info if everything fails
    // {
    //     host: '127.0.0.1',  // your host
    //     user: '', // your database username
    //     password: '', // your database password
    //     database: '', //SCHEMA to use
    //     charset: 'UTF8_GENERAL_CI'
        // debug: true
    //
    // }

//    connection: process.env.JAWSDB_URL || process.env.mysql_url

});
var DB = require('bookshelf')(knex);


module.exports.DB = DB;
