var DB = require('./db').DB;

var User = DB.Model.extend({
    tableName: 'cwUsers',
    idAttribute: 'userId'
});

var Words = DB.Model.extend({
    tableName: 'cwWords',
    idAttribute: 'entryId',
    hasTimestamps: true
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
        }).catch(function (err) {
        console.error(err);
    })

};

var rowEdit = function (columnId, question, answer, username, callback) {
    new Words({'entryId': columnId})
        .save({
                question: question,
                answer: answer,
                updated_by: username

            })//,
            //{patch: true})
        .then(function (result) {
            callback(result);
        }).catch(function (err) {
        console.error(err);
    })
};

module.exports = {
    User: User,
    Words: Words,
    fetcher: fetcher,
    rowDeleter: rowDeleter,
    rowEdit: rowEdit
};

