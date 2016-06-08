var knex = require('knex')({
    client: "mysql",

    //set to use env variable for connection in format: mysql://username:password@host:port/database
    connection: process.env.aruba_mysql //--mysql on arubacloud
     // process.env.gd_mysql //--go daddy mysql
    // process.env.mysql_url // --local mysql
    // or old fashioned hardcoded info if everything fails
    // connection:{
    //     host: '',  // your host
    //     user: '', // your database username
    //     password: '', // your database password
    //     database: '', //SCHEMA to use
    //     charset: 'UTF8_GENERAL_CI'
    //     // debug: true
    //
    // }

//    connection: process.env.JAWSDB_URL || process.env.mysql_url

});
var DB = require('bookshelf')(knex);


module.exports.DB = DB;
