
var knex = require('knex')({
    client: "mysql",
    connection: process.env.JAWSDB_URL || process.env.mysql_url
});
var DB = require('bookshelf')(knex);


module.exports.DB = DB;
