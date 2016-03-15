var DB = require('./db').DB;

var User = DB.Model.extend({
    tableName: 'cwUsers',
    idAttribute: 'userId',
    timestamps: true
});

var Words = DB.Model.extend({
    tableName: 'cwWords',
    idAttribute: 'entryId',
    timestamps: true

});

//DB query, post, delete, etc  helper functions
var fetcher = function (columnName, columnValue, callback) {
    Words.where(columnName, columnValue
    ).query()
        .then(function (result) {
                //console.log(result);
                callback(result);
            }
        )
};

var rowDeleter = function (columnId, callback) {
    Words.where('entryId', columnId)
        .destroy()
        .then(function (result) {
            //console.log(result);
            callback('deleted succesfully');
        })

};

module.exports = {
    User: User,
    Words: Words,
    fetcher: fetcher,
    rowDeleter: rowDeleter
};

