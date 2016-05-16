// vendor libraries
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bcrypt = require('bcrypt-nodejs');
var ejs = require('ejs');
var path = require('path');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var morgan = require('morgan');
var favicon = require('serve-favicon');
var compression = require('compression');


// custom libraries
// routes
var route = require('./route');
// model
var Model = require('./model');
//Custom middleware and stuff
var fn = require('./fn');

var urlencodedParser = bodyParser.urlencoded({extended: false});
//var jsonParser = bodyParser.json();

var app = express();

passport.use(new LocalStrategy(function (username, password, done) {
    new Model.User({username: username}).fetch().then(function (data) {
        var user = data;
        if (user === null) {
            return done(null, false, {message: 'Invalid username or password'});
        } else {
            user = data.toJSON();
            if (!bcrypt.compareSync(password, user.password)) {
                return done(null, false, {message: 'Invalid username or password'});
            } else {
                return done(null, user);
            }
        }
    });
}));

passport.serializeUser(function (user, done) {
    //console.log(user);
    done(null, user.username);
});

passport.deserializeUser(function (username, done) {
    new Model.User({username: username}).fetch().then(function (user) {
        done(null, user);
    });
});

//create user 'root' with admin priviledges and invalidate function after call
var createRoot = function () {
    createRoot = function () {
    };
    var checkRoot = new Model.User({username: 'root'}).fetch();
    return checkRoot.then(function (exists) {
        if (exists) {
            console.error('root already exists');
        } else {
            var password = 'noobsandboobs';
            var hash = bcrypt.hashSync(password);
            var root = new Model.User({
                username: 'root',
                password: hash,
                access_level: 'admin'
            });
            root.save()
                .then(function () {
                    console.info('root created');

                })
                .catch(function (err) {
                    console.error(err);
                })
        }
    })
};
createRoot();

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(cookieParser());
app.use(session({
    secret: 'noobs and boobs',
    name: "milojca.ssn",
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(morgan('dev', {immediate: false}));
app.use(compression({threshold: 1024}));
//    {
//    threshold: 500,
//    filter: function (req, res) {
//        var ct = res.get('content-type');
//        if (ct) {
//            return true
//        }
//        // return `true` for content types that you want to compress,
//        // `false` otherwise
//        console.log(ct);
//    }
//}));
app.use(express.static(path.join(__dirname, 'static')));
app.use(favicon(path.join(__dirname, '/static/favicon.ico')));


// GET
app.get('/', fn.protectedUser, route.index);

// signin
// GET
app.get('/signin', route.signIn);
// POST
app.post('/signin', urlencodedParser, route.signInPost);

// signup
// GET
//app.get('/signup', route.signUp);
// POST
//app.post('/signup', urlencodedParser, route.signUpPost);

// logout
// GET
app.get('/signout', route.signOut);

//mainPost
//POST
app.post('/mainPost', fn.protectedUser, urlencodedParser, route.mainPost);

//delete
//POST (jQuery AJAX)
app.post('/deleteRow', fn.protectedUser, urlencodedParser, route.deleteRow);

//edit
//POST
app.post('/editRow', fn.protectedUser, urlencodedParser, route.editRow);

//admin
//GET
app.get('/adminView', fn.protectedAdmin, route.adminView);

//admin Ajax Words Fetch
//GET
app.get('/adminWordsFetch', fn.protectedAdmin, route.adminWordsFetch);

//admin Ajax Users Fetch
//GET
app.get('/adminUsersFetch', fn.protectedAdmin, route.adminUsersFetch);

//Create new user from admin panel
//POST
app.post('/createUser', fn.protectedAdmin, urlencodedParser, route.createUser);

//Edit user info from admin panel
//POST
app.post('/editUser', fn.protectedAdmin, urlencodedParser, route.editUser);

//Catch all err hanadler
/********************************/
app.use(function (err, req, res, next) {
    console.log('error handler triggered!');
    console.error(err.stack);
    res.status(500).send('Nesto se iskundachilo!');
});
/********************************/
// 404 not found
app.use(route.notFound404);

var server = app.listen(app.get('port'), function (err) {
    if (err) throw err;

    var message = 'Server is running @ http://localhost:' + server.address().port;
    console.log(message);
});

