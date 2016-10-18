var DB = require('./db').DB;
var bcrypt = require('bcrypt-nodejs');
var moment = require('moment');

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
        return console.log('ALL SAVED');
    }

});


var Words = DB.Model.extend({
    tableName: 'cwWords',
    idAttribute: 'entryid',
    hasTimestamps: true,

    initialize: function () {
        this.on('destroyed', this.destroyed);
        // this.on('fetching', this.trt);
    },

    destroyed: function () {
        return console.info('Delete function completed');
    },

    // toJSON: function () {
    //     var attrs = DB.Model.prototype.toJSON.apply(this, arguments);
    //     attrs.created_at = attrs.created_at.toISOString();
    //     // console.log(attrs);
    //     return attrs;
    // }

    parse: function (attrs) {
        "use strict";
        // JSON.stringify(attrs);
        // console.log(attrs);
        attrs.created_at = moment(attrs.created_at).format('YYYY-MM-DD  HH:mm:ss');
        return attrs;
    }

    // count: function (cb) {
    //     DB.knex('example')
    //         .count('id')
    //         .then(function (count) {
    //             cb(null, count)
    //         })
    //         .catch(function (err) {
    //             cb(err)
    //         })
    // }
//
// // console.log(attrs.created_at);
// // attrs.updated_at = attrs.updated_at.toISOString();
// // attrs.updated_at = moment(attrs.updated_at).format('DD-MMM-YYYY  HH:mm:ss');
//
//         },
//     toJSON: function () {
//         var attrs = DB.Model.prototype.toJSON.apply(this, arguments);
//         attrs.stojadin = this.get('created_at').toISOString();
//         return attrs;
//     }
// get:function (attrs) {
//     return attrs.mudo = this.get(attrs.created_at);
// }
});

var Approved = DB.Model.extend({
    tableName: 'cwApprovedWords',
    idAttribute: 'entryid'

});

var WordsCollection = DB.Collection.extend({
    model: Words
});
var ApprovedCollection = DB.Collection.extend({
    model: Approved
});


//user counter
var userCount = function (callback) {
    new User().count('userid', 'password')
        .then(function (count) {
            callback(count);
        })
        .catch(function (err) {
            console.error(err);
            callback({error: true, message: 'Database Error!'});

        });
};

//words counter
var groupCounter = function (selectColumn, table, groupBycolumn, cb) {
    DB.knex.select(selectColumn).count('* as count').from(table).groupBy(groupBycolumn)
        .then(function (res) {
            cb(res);
        })
        .catch(function (err) {
            console.error(err);
            cb({error: true, message: 'Database Error!'});

        });
};

var rowCount = function (cond, cb) {
    if (cond) {
        new Words().where(cond).count()
            .then(function (count) {
                // console.log(count);
                cb(count);
            })
            .catch(function (err) {
                console.error(err);
                cb({error: true, message: 'Database Error!'});
            })
    } else {
        new Words().count()
            .then(function (count) {
                // console.log(count);
                cb(count);
            })
            .catch(function (err) {
                console.error(err);
                cb({error: true, message: 'Database Error!'});
            })
    }
};

var filteredRowCount = function (cond, cb) {
    new Words().query(function (qb) {
        qb.where('question', 'LIKE', cond + '%').orWhere('answer', 'LIKE', cond + '%')
    }).count().then(function (result) {
        cb(result);
        // console.log(result);
    }).catch(function (err) {
        console.error(err);
        cb({error: true, message: 'Database Error!'});
    })
};

var newWordsSave = function (data, cb) {
    //console.log(data);
    new Words({question: data.question, answer: data.answer})
        .fetch()
        .then(function (model) {
            if (model) {
                cb({error: true, message: 'Entry already exists!'})
            } else {
                new Words(data)
                    .save()
                    .then(function (model) {
                        // console.log(model);
                        cb({error: false, message: 'Saved succesfully!', xData: model.attributes.entryid});


                    })
                    .catch(function (err) {
                        if (err) {
                            console.error(err);
                            cb({error: true, message: 'Database Error!'});

                        }
                    })
            }
        })
        .catch(function (err) {
            if (err) {
                console.error(err);
                cb({error: true, message: 'Database Error!'});

            }
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
            console.error(err);
            callback({error: true, message: 'Database Error!'});

        });
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
            callback({error: true, message: 'Database Error!'});

        });

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
            callback({error: true, message: 'Database Error!'});

        });
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
                        callback({error: true, message: 'Database Error!'});

                    });
            }
        })
        .catch(function (err) {
            console.error(err);
            callback({error: true, message: 'Database Error!'});

        });
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
            callback({error: true, message: 'Database Error!'});

        });

};

var userDelete = function (data, callback) {
    new User({userid: data.userid})
        .fetch({require: true})
        .then(function (result) {
            result
                .destroy()
                .then(function () {
                    callback(data);
                })
                .catch(function (err) {
                    console.error(err);
                    callback({error: true, message: 'Database Error!'});

                });
        })
        .catch(function (err) {
            console.error(err);
            callback({error: true, message: 'Database Error!'});

        });

};

var wordsEdit = function (data, callback) {
    new Words({entryid: data.entryid})
        .fetch({require: true})
        .then(function (result) {
            // console.log(data)
            result.save(data)
                .then(function (result) {
                    callback(result);
                })
                .catch(function (err) {
                    console.error(err);
                    callback({error: true, message: 'Database Error!'});

                });
        })
        .catch(function (err) {
            console.error(err);
            callback({error: true, message: 'Database Error!'});

        });
};

var wordsDelete = function (data, callback) {
    new Words({entryid: data.entryid})
        .fetch({require: true})
        .then(function (result) {
            if (result.attributes.is_approved === 1) {
                callback({error: true, message: 'Row is locked, uneditable and undeletable!'});
            } else {
                // console.log(result);
                result
                    .destroy()
                    .then(function () {
                        callback(data);
                    })
                    .catch(function (err) {
                        console.error(err);
                        callback({error: true, message: 'Database Error!'});
                    })
            }

        })
        .catch(function (err) {
            console.error(err);
            callback({error: true, message: 'Database Error!'});
        });
};

var wordsApprove = function (data, username, callback) {
    if (data.is_approved === '1' || data.is_approved === '0') {
        new Words({entryid: data.entryid})
            .fetch({require: true})
            .then(function (result) {
                return result.save(data);
            })
            .then(function (saved) {
                saved.set({approved_by: username});
                var data = saved.toJSON();
                delete data.sessionid;
                if (data.is_approved === '1') {
                    delete data.is_approved;
                    // console.log(data);
                    new Approved()
                        .save(data)
                        .then(function (approvedModel) {
                            callback(approvedModel);
                        })
                        .catch(function (err) {
                            console.error(err);
                            callback({error: true, message: 'Database Error!'});
                        });
                } else if (data.is_approved === '0') {
                    new Approved({entryid: data.entryid})
                        .destroy()
                        .then(function () {
                            callback(data);
                        })
                        .catch(function (err) {
                            console.error(err);
                            callback({error: true, message: 'Database Error!'});
                        });
                }
            })
            .catch(function (err) {
                console.error(err);
                callback({error: true, message: 'Database Error!'});
            });


    } else {
        throw new Error('Invalid data!');

    }
};

module.exports = {
    User: User,
    Words: Words,
    WordsCollection: WordsCollection,
    Approved: Approved,
    ApprovedCollection: ApprovedCollection,
    userCount: userCount,
    groupCounter: groupCounter,
    fetcher: fetcher,
    newWordsSave: newWordsSave,
    rowDeleter: rowDeleter,
    rowEdit: rowEdit,
    newUserSave: newUserSave,
    userEdit: userEdit,
    userDelete: userDelete,
    wordsEdit: wordsEdit,
    wordsDelete: wordsDelete,
    wordsApprove: wordsApprove,
    rowCount: rowCount,
    filteredRowCount: filteredRowCount
};

