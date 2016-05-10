// vendor library
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var moment = require('moment');


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
    var sess = req.sessionID;
    //console.log(user);
    var errorMessage = req.session.exists;
    var infoMessage = req.session.success;
    var arr = [];
    if (user) {
        user = user.toJSON();
    }
    delete req.session.exists;
    delete req.session.success;
    //console.log(infoMessage);
    //console.log(req.session);
    Model.fetcher('created_by', user.username, result);
    function result(result) {
        arr = result;
        arr.reverse();
        res.render('index', {
            title: 'Home', user: user,
            errorMessage: errorMessage, infoMessage: infoMessage,
            query: arr, sess: sess
        })
    }

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
        req.logout();
        res.redirect('/signin');
    }
};

// 404 not found
var notFound404 = function (req, res, next) {
    res.status(404);
    res.render('404', {title: '404 Not Found'});
};

//main
//POST
var mainPost = function (req, res, next) {

    var words = req.body;
    var user = req.user.toJSON();
    //console.log(user);
    //console.log(req.sessionID);
    var wordsCheck = new Model.Words({
        question: words.question,
        answer: words.answer
    }).fetch();
    //console.log(req.body);
    return wordsCheck
        .then(function (exists) {
            //console.log(wordsCheck);
            //console.log(exists);
            if (exists) {
                //res.render('index', {title: 'Home', errorMessage: 'already exists'});
                req.session.exists = "Entry already exists";
                return res.redirect('/');
            } else {
                var wordsWrite = new Model.Words({
                    question: words.question,
                    answer: words.answer,
                    created_by: user.username,
                    sessionid: req.sessionID
                });
                wordsWrite.save()
                    .then(function (success) {
                        if (success) {
                            //console.log(success);
                            req.session.success = "Epic Success!!!";
                            //console.log(req.session);
                            return res.redirect('/');
                        }
                    }).catch(function (err) {
                    console.error(err);

                });
            }
        })

};

//deleteRow
//POST
var deleteRow = function (req, res, next) {
    // console.log(req.body);
    // console.log(req.user);

    var deleteRow = req.body.entryId;
    //console.log(deleteRow);
    Model.rowDeleter(deleteRow, result);
    function result(result) {
        //console.log(result);
        res.end(result);
    }
};

//editRow
//POST
var editRow = function (req, res, next) {
    // console.log(req.body);
    var user = req.user.toJSON();
    //console.log(user);
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
        res.end(jqres);
    }

};

//Admin
//GET
var adminView = function (req, res, next) {
    var user = req.user.toJSON();
    Model.userCount(function (result) {
        console.log(result)
    });
    res.render('admin', {
        title: 'Admin Control Panel',
        user: user
    });
};

//Admin Ajax Words Fetch
//GET
var adminWordsFetch = function (req, res, next) {
    //console.log(req.headers);
    var dbView = new Model.Words().fetchAll().then(function (data) {
        dbView = data.toJSON();
        res.render('ajax_views/table-words', {dbView: dbView, dateParser: fn.dateParser});
    })
};

//Admin Ajax Users Fetch
//GET
var adminUsersFetch = function (req, res, next) {
    // console.log(req.headers);
    var dbView = new Model.User().fetchAll().then(function (data) {
        dbView = data.toJSON();
        Model.groupCounter('access_level', 'cwUsers', 'access_level', function (result) {
            //console.log(result);
            var counter = result;
            res.render('ajax_views/table-users', {dbView: dbView, dateParser: fn.dateParser, counter: counter});

        });
        //console.log(dbView);
        //res.end('GG');
    })
};

//Admin create user
//POST
var createUser = function (req, res, next) {
    // console.log(req.headers);
    //console.log(req.body);
    var data = req.body;
    // console.log(typeof data);
    Model.newUserSave(data, function (callback) {
        var userData = (callback);
        userData.created_at = fn.dateParser(userData.created_at);
        res.end(JSON.stringify(userData));

    })
};


// export functions
/**************************************/
// index
module.exports.index = index;

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

//home POST
module.exports.mainPost = mainPost;

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

//testRoute
module.exports.createUser = createUser;


