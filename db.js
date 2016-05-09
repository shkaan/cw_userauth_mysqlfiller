
var knex = require('knex')({
    client: "mysql",
    connection: {
        host: 'l9dwvv6j64hlhpul.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',  // your host
        user: 'iyc4qnjpwpyk0rs0', // your database username
        password: 'y0llnux5zzuzu3kr ', // your database password
        database: 'k2yzot55d4yv5e7l', //SCHEMA to use
        charset: 'UTF8_GENERAL_CI'

    }
});
var DB = require('bookshelf')(knex);


module.exports.DB = DB;
