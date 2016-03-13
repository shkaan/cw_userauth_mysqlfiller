
var knex = require('knex')({
    client: "mysql",
    connection: {
        host: 'localhost',  // your host
        user: 'root', // your database username
        password: 'Bajaim13', // your database password
        database: 'crossword', //SCHEMA to use
        charset: 'UTF8_GENERAL_CI'

    }
});
var DB = require('bookshelf')(knex);


module.exports.DB = DB;
