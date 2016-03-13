// vendor library
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');


// custom library
// model
var Model = require('./model');
//console.log(Model);
var fetcher = require('./model');
//console.log(Model);

// index
var index = function (req, res, next) {
    //console.log("Cookies: ", req.headers.cookie);
    //console.log(req.cookies);
    if (!req.isAuthenticated()) {
        res.redirect('/signin');
    } else {
        var user = req.user;
        var errorMessage = req.session.exists;
        var infoMessage = req.session.success;
        var arr = [];
        if (user !== null) {
            user = user.toJSON();
        }
        delete req.session.exists;
        delete req.session.success;
        //console.log(infoMessage);
        //console.log(req.session);
        Model.fetcher(req.sessionID, result);
        function result(result) {
            arr = result;
            //console.log(arr);
            //arr.forEach(function (test) {
            //        var print = test;
            //        console.log(print.question)
            //    }
            //);
            res.render('index', {
                title: 'Home', user: user.username,
                errorMessage: errorMessage, infoMessage: infoMessage,
                question: arr
            });
            //question: question, answer: answer
        }

        //console.log(user);

        //console.log(user.username);
    }

};


//console.log(req.session);
//console.log("Cookies: ", req.cookies);
//console.log(user);


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
    //var usernamePromise = null;

    var usernamePromise = new Model.User({username: user.username}).fetch();


    return usernamePromise.then(function (model) {

        if (model) {
            res.render('signup', {title: 'signup', errorMessage: 'username already exists'});
        } else {
            //****************************************************//
            // MORE VALIDATION GOES HERE(E.G. PASSWORD VALIDATION)
            //****************************************************//
            var password = user.password;
            var hash = bcrypt.hashSync(password);

            var signUpUser = new Model.User({username: user.username, password: hash});

            signUpUser.save().then(function (model) {
                // sign in the newly registered user
                signInPost(req, res, next);
            });
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
                req.session.exists = "already exists";
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
                            req.session.success = "epic success";
                            req.session.question = wordsWrite.toJSON().question;
                            req.session.answer = wordsWrite.toJSON().answer;
                            //console.log(req.session);

                            return res.redirect('/');
                        }
                    }).catch(function (err) {
                    throw err
                });
            }
        })
};

//deleteRow
//POST
var deleteRow = function (req, res, next) {
    console.log(req.body);
    res.end('received and responded');
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