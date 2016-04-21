var DB = require('./db').DB;
var bcrypt = require('bcrypt-nodejs');

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
        .then(function (result) {
            // console.log(result);
            callback(columnId);
        })
        .catch(function (err) {
            console.error(err);
        })

};

var rowEdit = function (columnId, question, answer, username, callback) {
    new Words({'entryId': columnId})
        .save({
            question: question,
            answer: answer,
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
                                callback(fetchResult);
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
    fetcher: fetcher,
    rowDeleter: rowDeleter,
    rowEdit: rowEdit,
    newUserSave: newUserSave
};

