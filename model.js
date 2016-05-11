var DB = require('./db').DB;
var bcrypt = require('bcrypt-nodejs');

var User = DB.Model.extend({
    tableName: 'cwUsers',
    idAttribute: 'userId',
    hasTimestamps: true
});

var Words = DB.Model.extend({
    tableName: 'cwWords',
    idAttribute: 'entryId',
    hasTimestamps: true
});


//user counter
var userCount = function (callback) {
    new User().count('userID', 'password')
        .then(function (count) {
            callback(count);
        })
        .catch(function (err) {
            console.error(err);
        })
};

//words counter
var groupCounter = function (selectColumn, table, groupBycolumn, cb) {
    DB.knex.select(selectColumn).count('* as count').from(table).groupBy(groupBycolumn)
        .then(function (res) {
            cb(res);
        })
        .catch(function (err) {
            console.error(err);
        })
};


//DB query, post, delete, etc  helper functions
var fetcher = function (columnName, columnValue, callback) {
    Words.where(columnName, columnValue)
        .query()
        .then(function (result) {
                //console.log(result);
                callback(result);
            }
        )
        .catch(function (err) {
            console.error(err)
        })
};

var rowDeleter = function (columnId, callback) {
    Words.where('entryId', columnId)
        .destroy()
        .then(function () {
            // console.log(result);
            callback(columnId);
        })
        .catch(function (err) {
            console.error(err);
        })

};

var rowEdit = function (data, username, callback) {
    new Words({entryId: data.entryId})
        .save({
            question: data.question,
            answer: data.answer,
            updated_by: username
        })
        .then(function (result) {
            callback(result);
        })
        .catch(function (err) {
            console.error(err);
        })
};


var newUserSave = function (data, callback) {
    new User({username: data.username})
        .fetch()
        .then(function (result) {
            if (result) {
                callback({status: 'exists'});
            } else {
                new User(data).set('password', bcrypt.hashSync(data.password))
                    .save()
                    .then(function (result) {
                        result = result.toJSON();
                        new User({username: result.username})
                            .fetch()
                            .then(function (fetchResult) {
                                var parsedData = fetchResult.toJSON();
                                callback(parsedData);
                            });
                    })
                    .catch(function (err) {
                        console.error(err);
                    })
            }
        })
        .catch(function (err) {
            console.error(err);

        })
};

module.exports = {
    User: User,
    Words: Words,
    userCount: userCount,
    groupCounter: groupCounter,
    fetcher: fetcher,
    rowDeleter: rowDeleter,
    rowEdit: rowEdit,
    newUserSave: newUserSave
};

