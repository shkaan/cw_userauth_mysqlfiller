// vendor library
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var moment = require('moment');
var jwt = require('jsonwebtoken');
var xssFilters = require('xss-filters');


// custom library
// model
var Model = require('./model');

//helper functions
var fn = require('./fn');

// index
var index = function (req, res, next) {
    //console.log("Cookies: ", req.headers.cookie);
    //console.log(req.cookies);
    var user = req.user;
    //var sess = req.sessionID;
    //console.log(user);
    // var errorMessage = req.session.exists;
    // var infoMessage = req.session.success;
    // var arr = [];
    if (user) {
        user = user.toJSON();
    }
    // delete req.session.exists;
    // delete req.session.success;
    //console.log(infoMessage);
    //console.log(req.session);
    // Model.fetcher('created_by', user.username, result);
    // function result(result) {
    //     arr = result;
    // arr.reverse();
    res.render('indexTest', {
        title: 'Home', user: user
        // errorMessage: errorMessage, infoMessage: infoMessage,
        // query: arr, sess: sess
        // });
    })

};

var indexPost = function (req, res, next) {
    req.body.question = xssFilters.inHTMLData(req.body.question);
    req.body.answer = xssFilters.inHTMLData(req.body.answer);
    //console.log(req.body);
    var user = req.user.toJSON();
    req.body.created_by = user.username;
    req.body.sessionid = req.sessionID;

    Model.newWordsSave(req.body, function (result) {
        console.log(result);
        res.json(result);
    });

};

var indexData = function (req, res, next) {
    "use strict";
    // console.log(req.query);
    var tableData;
    var rowCount;
    var filteredRowCount;
    var user = req.user;
    var dbColumn = {2: 'question', 3: 'answer', 4: 'created_at'};
    if (user) {
        user = user.toJSON();
    }

    var finished = function () {
        if (rowCount && tableData && filteredRowCount) {
            var dataObject = {
                draw: req.query.draw,
                recordsTotal: rowCount,
                recordsFiltered: filteredRowCount,
                aaData: tableData
            };
            res.json(dataObject);
        }
    };


    Model.rowCount({created_by: user.username}, function (cnt) {
        rowCount = cnt;
        finished();
    });

    new Model.Words().query(function (qb) {
        qb.where(function () {
            this.where('answer', 'LIKE', req.query.search.value + '%').orWhere('question', 'LIKE', req.query.search.value + '%')
        }).andWhere('created_by', user.username)
    }).count().then(function (result) {
        filteredRowCount = result;
        finished();
        // console.log(result);
    });

    Model.WordsCollection.query(function (qb) {
        qb.where(function () {
            this.where('question', 'LIKE', req.query.search.value + '%').orWhere('answer', 'LIKE', req.query.search.value + '%')
        }).andWhere('created_by', user.username).limit(parseInt(req.query.length, 10)).offset(parseInt(req.query.start, 10))
            .orderBy(dbColumn[req.query.order[0].column], req.query.order[0].dir)
    }).fetch()
        .then(function (model) {
            var jModel = model.toJSON();
            var len = jModel.length;
            for (var i = 0; i < len; i++) {
                if (req.query.order[0].dir === 'asc') {
                    jModel[i].indexField = i + parseInt(req.query.start, 10) + 1;
                } else {
                    jModel[i].indexField = rowCount - (i + parseInt(req.query.start, 10));
                }
            }
            tableData = jModel;
            console.log(rowCount);
            console.log(jModel[0].indexField);
            finished();
        })
        .catch(function (err) {
            console.error(err);
            res.send({error: true, message: 'Database Error!'});
        })
};


// sign in
// GET
var signIn = function (req, res, next) {
    if (req.isAuthenticated()) res.redirect('/');
    //console.log(req);
    res.render('signin', {title: 'Sign In'});
};

// sign in
// POST
var signInPost = function (req, res, next) {

    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/signin'
    }, function (err, user, info) {
        if (err) {
            return res.render('signin', {title: 'Sign In', errorMessage: err.message});
        }

        if (!user) {
            return res.render('signin', {title: 'Sign In', errorMessage: info.message});
        }
        return req.logIn(user, function (err) {
            if (err) {
                return res.render('signin', {title: 'Sign In', errorMessage: err.message});
            } else {
                //console.log(req.body);
                return res.redirect('/');

            }
        });
    })(req, res, next);
};

// sign up
// GET
var signUp = function (req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/');
    } else {
        res.render('signup', {title: 'Sign Up'});
    }
};

// sign up
// POST
var signUpPost = function (req, res, next) {
    var user = req.body;
    // console.log(req.body);
    //var usernamePromise = null;

    var usernamePromise = new Model.User({username: user.username}).fetch();

    return usernamePromise.then(function (model) {

        if (model) {
            res.render('signup', {title: 'signup', errorMessage: 'username already exists'});
        } else {

            var password = user.password;
            var hash = bcrypt.hashSync(password);

            var signUpUser = new Model.User({username: user.username, password: hash});

            signUpUser
                .save()
                .then(function (model) {
                    // sign in the newly registered user
                    signInPost(req, res, next);
                })
                .catch(function (err) {
                        console.error(err);
                        res.send('500');

                    }
                );
        }
    });
};

// sign out
var signOut = function (req, res, next) {
    if (!req.isAuthenticated()) {
        notFound404(req, res, next);
    } else {
        // req.logout();
        req.session.destroy(function (err) {
            if (err) {
                console.error(err);
            } else {
                console.info('Session destroyed!');
            }
        });
        res.redirect('/');
    }
};

// 404 not found
var notFound404 = function (req, res, next) {
    res.status(404);
    res.render('404', {title: '404 Not Found'});
};

//main -- deprecated
//POST
// var mainPost = function (req, res, next) {
//
//     var words = req.body;
//     var user = req.user.toJSON();
//     //console.log(user);
//     //console.log(req.sessionID);
//     var wordsCheck = new Model.Words({
//         question: words.question,
//         answer: words.answer
//     }).fetch();
//     //console.log(req.body);
//     return wordsCheck
//         .then(function (exists) {
//             //console.log(wordsCheck);
//             //console.log(exists);
//             if (exists) {
//                 //res.render('index', {title: 'Home', errorMessage: 'already exists'});
//                 req.session.exists = "Entry already exists";
//                 return res.redirect('/');
//             } else {
//                 var wordsWrite = new Model.Words({
//                     question: words.question,
//                     answer: words.answer,
//                     created_by: user.username,
//                     sessionid: req.sessionID
//                 });
//                 wordsWrite.save()
//                     .then(function (success) {
//                         if (success) {
//                             //console.log(success);
//                             req.session.success = "Epic Success!!!";
//                             //console.log(req.session);
//                             return res.redirect('/');
//                         }
//                     })
//                     .catch(function (err) {
//                         console.error(err);
//                         return res.status(500).send({error: true, message: err.message});
//                     });
//             }
//         })
//         .catch(function (err) {
//             console.error(err);
//             return res.status(500).send({error: true, message: err.message});
//
//         });
//
// };

//deleteRow
//POST
var deleteRow = function (req, res, next) {
    // console.log(req.body);
    // console.log(req.user);
    var deleteRow = req.body.entryid;
    //console.log(deleteRow);
    Model.rowDeleter(deleteRow, result);
    function result(result) {
        //console.log(result);
        res.send(result);
    }
};

//editRow
//POST
var editRow = function (req, res, next) {
    // console.log(req.body);
    var user = req.user.toJSON();
    // console.log(req.body);
    //console.log(entryId + "::" + question + "::" + answer);
    Model.rowEdit(req.body, user.username, result);
    function result(result) {
        //console.log (result);
        var resultParse = result.toJSON();
        var jqres = JSON.stringify(resultParse);
        //var jpars = JSON.parse(jqres);
        //console.log(result);
        //console.log(jqres);
        //console.log(jpars);
        // res.writeHead(200, {'Content-Type': 'text/plain'});
        res.send(jqres);
    }

};

//Admin
//GET
var adminView = function (req, res, next) {
    var user = req.user.toJSON();
    res.render('admin', {
        title: 'Admin Control Panel',
        user: user
    });
};

//Admin Ajax Words Fetch
//GET
var adminWordsFetch = function (req, res, next) {
    // console.log(req.headers);
    // var dbView = new Model.Words().fetchAll().then(function (data) {
    //     dbView = data.toJSON();
    // for (var i in dbView){
    //     dbView[i].created_at=fn.dateParser(dbView[i].created_at);
    // }
    // console.log(dbView);


    res.render('ajax_views/table-words-plain', {
        // dbView: dbView,
        // dateParser: fn.dateParser
    });
    // });
};

//Admin Ajax Users Fetch
//GET
var adminUsersFetch = function (req, res, next) {
    // console.log(req.headers);
    var dbView = new Model.User().fetchAll().then(function (data) {
        dbView = data.toJSON();
        Model.groupCounter('access_level', 'cwUsers', 'access_level', function (result) {
            //console.log(result);
            // console.log(counter);
            res.render('ajax_views/table-users', {
                dbView: dbView,
                dateParser: fn.dateParser,
                counter: result
            });
        });
    });
};

var adminApprovedFetch = function (req, res, next) {
    var dbView = new Model.Approved().fetchAll().then(function (data) {
        dbView = data.toJSON();
        // console.log(dbView);
        res.render('ajax_views/table-approved', {
            dbView: dbView,
            dateParser: fn.dateParser
        });
    });

};

var dataRefresh = function (req, res, next) {
    console.log(req.query);
    var rowCount;
    var filteredRowCount;
    var tableData;
    var dbColumn = {1: 'question', 2: 'answer', 3: 'created_by', 4: 'created_at', 5: 'updated_by'};
    // console.log(dbColumn[req.query.order[0].column]);

    var finished = function () {
        if (rowCount != null && tableData != null && filteredRowCount != null) {
            var dataObject = {
                draw: req.query.draw,
                recordsTotal: rowCount,
                recordsFiltered: filteredRowCount,
                aaData: tableData
            };
            // console.log(tableData)
            res.json(dataObject);
        }
    };

    Model.rowCount(null, function (cnt) {
        // console.log(data);
        rowCount = cnt;
        finished();
    });

    Model.filteredRowCount(req.query.search.value, function (cnt) {
        filteredRowCount = cnt;
        finished();
    });
    // console.log(data);

    if (req.query.search.value || req.query.order[0].column) {
        Model.Words.query(function (qb) {
            qb.where('question', 'LIKE', req.query.search.value + '%').orWhere('answer', 'LIKE', req.query.search.value + '%')
                .limit(parseInt(req.query.length, 10)).offset(parseInt(req.query.start, 10))
                .orderBy(dbColumn[req.query.order[0].column], req.query.order[0].dir)
        }).fetchAll()
            .then(function (model) {
                tableData = model;
                finished();
            })
            .catch(function (err) {
                console.error(err);
                res.send({error: true, message: 'Database Error!'});
            })
    }
    else {
        new Model.Words().fetchAll().then(function (model) {
            tableData = model;
            finished();
        });
    }
};


//Admin create user
//POST
var createUser = function (req, res, next) {
    //console.log(req.headers);
    console.log(req.body);
    var data = req.body;
    // console.log(req.body);
    Model.newUserSave(data, function (callback) {
        if (callback.error === true) {
            res.status(500);
        }
        var userData = callback;
        userData.created_at = fn.dateParser(userData.created_at);
        res.send(JSON.stringify(userData));
    });
};

var editUser = function (req, res, next) {
    console.log(req.body);
    if (req.body.password) {
        console.log('YAAAAAY PASSWORD - hashing');
        req.body.password = bcrypt.hashSync(req.body.password);
    } else {
        console.log('NO PASSWORD - DELETING');
        delete req.body.password;
    }
    Model.userEdit(req.body, function (callback) {
        if (callback.error === true) {
            res.status(500);
        }
        res.send(JSON.stringify(callback));
    });
};

var deleteUser = function (req, res, next) {
    // console.log(req.body);
    Model.userDelete(req.body, function (callback) {
        // console.log(callback);
        if (callback.error === true) {
            res.status(500);
        }
        res.send(JSON.stringify(callback));

    });
};

var editWords = function (req, res, next) {
    console.log(req.body);
    if (req.body) {
        req.body.updated_by = req.user.attributes.username;
        Model.wordsEdit(req.body, function (callback) {
            // console.log(callback);
            if (callback.error === true) {
                res.status(500);
            }
            res.send(JSON.stringify(callback));
        });
    }


};

var deleteWords = function (req, res, next) {
    // console.log(req.body);
    if (req.body) {
        Model.wordsDelete(req.body, function (callback) {
            if (callback.error === true) {
                res.status(500);
            }
            res.send(JSON.stringify(callback));
        });

    }
};

var approveWords = function (req, res, next) {
    // console.log(req.body);
    if (req.body) {
        Model.wordsApprove(req.body, req.user.attributes.username, function (callback) {
            // console.log(callback);
            if (callback.error === true) {
                res.status(500);
            }
            res.send(JSON.stringify(callback));
        });
    }
};

//REST API ROUTES:

var api = function (req, res, next) {
    "use strict";
    console.log(req.headers);
    res.json({message: 'Welcome to the coolest API on earth!'});
};

var auth = function (req, res, next) {
    "use strict";
    //console.log(req.body);
    new Model.User({username: req.body.username})
        .fetch()
        .then(function (modelData) {
            "use strict";
            //console.log(modelData);
            if (modelData === null) {
                res.json({success: false, message: "Invalid username or password"})
            } else {
                var userData = modelData.toJSON();
                //console.log(userData);
                if (!bcrypt.compareSync(req.body.password, userData.password)) {
                    res.json({success: false, message: 'Invalid username or password'});
                } else {
                    jwt.sign(
                        {
                            userid: userData.userid,
                            username: userData.username,
                            access_level: userData.access_level
                        }, "supaSecretTokenDzenerejtor",
                        {
                            expiresIn: '1440m' // expires in 24 hours
                        }, function (err, token) {
                            if (err) {
                                console.error(err);
                                res.json({success: false, message: err.message});
                            } else {
                                res.json({success: true, message: "GG", token: token})
                            }
                        });
                }
            }
        })
        .catch(function (err) {
            console.error(err);
        })

};

var userEntries = function (req, res, next) {
    console.log(req.user);
    Model.WordsCollection.forge().query(function (qb) {
        //qb is knex query builder, use knex function here
        qb.offset(0).limit(10);
    })
        .fetch().then(function (result) {
        //console.log(result);
        res.json({success: true, apiData: result})
    });
};


// export functions
/**************************************/
// index
module.exports.index = index;

//indexPost
module.exports.indexPost = indexPost;

//indexData
//GET ajax index table
module.exports.indexData = indexData;

// sigin in
// GET
module.exports.signIn = signIn;
// POST
module.exports.signInPost = signInPost;

// sign up
// GET
module.exports.signUp = signUp;
// POST
module.exports.signUpPost = signUpPost;

// sign out
module.exports.signOut = signOut;

// 404 not found
module.exports.notFound404 = notFound404;

//home POST -- deprecated
//module.exports.mainPost = mainPost;

//deleteRow
module.exports.deleteRow = deleteRow;

//editRow
module.exports.editRow = editRow;

//adminView
module.exports.adminView = adminView;

//Ajax Words
module.exports.adminWordsFetch = adminWordsFetch;

//Ajax Users
module.exports.adminUsersFetch = adminUsersFetch;

//Ajax approved words
module.exports.adminApprovedFetch = adminApprovedFetch;

//Ajax create user
module.exports.createUser = createUser;

//Ajax edit user
module.exports.editUser = editUser;

//Ajax delete user
module.exports.deleteUser = deleteUser;

//Ajax edit words
module.exports.editWords = editWords;

//Ajax delete words
module.exports.deleteWords = deleteWords;

//Ajax approve words
module.exports.approveWords = approveWords;

//Refresher
module.exports.dataRefresh = dataRefresh;

//REST API DEFAULT
module.exports.api = api;

//REST API Auth
module.exports.auth = auth;

//REST API return user entries
module.exports.userEntries = userEntries;


