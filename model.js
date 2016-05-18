var DB = require('./db').DB;
var bcrypt = require('bcrypt-nodejs');

var User = DB.Model.extend({
    tableName: 'cwUsers',
    idAttribute: 'userid',
    hasTimestamps: true,

    initialize: function () {
        this.on('saving', this.validateSave);
        this.on('saved', this.saved);
    },

    validateSave: function () {
        return console.log(this.attributes.password);
    },
    saved: function () {
        return console.log('ALL SAVED')
    }
});


var Words = DB.Model.extend({
    tableName: 'cwWords',
    idAttribute: 'entryid',
    hasTimestamps: true
});


//user counter
var userCount = function (callback) {
    new User().count('userid', 'password')
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
    Words.where('entryid', columnId)
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
    new Words({entryid: data.entryid})
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
    // console.log(data);
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

var userEdit = function (data, callback) {
    new User({userid: data.userid})
        .save(data, {
            require: false
        })
        .then(function (res) {
            callback(res);
            //console.log(res)
        })
        .catch(function (err) {
            console.error(err);
        })

};

var userDelete = function (data, callback) {
    new User({userid: data.userid})
        .fetch({require:true})
        .then(function (result) {
            result
                .destroy()
                .then(function () {
                    callback(data);
                })
                .catch(function (err) {
                    console.error(err);
                });
        })
        .catch(function (err) {
            console.error(err);
            callback(err);
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
    newUserSave: newUserSave,
    userEdit: userEdit,
    userDelete: userDelete
};

