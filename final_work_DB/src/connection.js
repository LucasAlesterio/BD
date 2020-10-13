//var user = "postgres";
//var password = "220199";

var user = "user_1";
//var user = "master_1";
var password = "123";

var knex = require('knex')(
    {
        client: 'pg',
        version: '7.2',
        connection: {
        host : 'localhost',
        user : user,
        password : password,
        database : 'starlinks'
        }
    }
);

module.exports = knex;