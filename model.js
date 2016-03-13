var DB = require('./db').DB;

var User = DB.Model.extend({
    tableName: 'cwUsers',
    idAttribute: 'userId',
    timestamps: true
});

var Words = DB.Model.extend({
    tableName: 'cwWords',
    timestamps: true

});

//Fetch helper function
var fetcher = function (id, callback) {
    //var sessid = id;
    Words.where({
        sessionid: id
    }).query()
        .then(function (result) {
                //console.log(result);
                callback(result);
            }
        )
};

//module.exports.fetcher = fetcher;


module.exports = {
    User: User,
    Words: Words,
    fetcher: fetcher
};

