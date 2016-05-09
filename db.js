
var knex = require('knex')({
    client: "mysql",
    connection: process.env.JAWSDB_URL
});
var DB = require('bookshelf')(knex);


module.exports.DB = DB;
