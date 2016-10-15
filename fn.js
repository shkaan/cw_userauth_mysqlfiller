/**
 * Created by Wish Kaan on 04-Apr-16.
 */
var moment = require('moment');
var jwt = require('jsonwebtoken');


//parsing dates to more readable format in views
var dateParser = function (date) {
    return moment(date).format('DD-MMM-YYYY  HH:mm:ss');
};


//use on routes that require user level access
var protectedUser = function (req, res, next) {
    if (!req.isAuthenticated()) {
        return res.redirect('/signin');
    } else {
        next();
    }
};

//use on routes that require admin level access
var protectedAdmin = function (req, res, next) {
    var route = req.url;
    // console.log(route);
    if (req.user) {
        var user = req.user.toJSON();
        if (!req.isAuthenticated() || user.access_level !== 'admin') {
            console.log(user.username + ' tried to access ' + route + '\n404 rendered!');
            res.status(404);
            return res.render('404', {title: '404 Not Found'});
        } else {
            next();
        }
    } else {
        console.error('Protected route hit, user undefined!');
        return next(new Error('You need to be logged in'));
    }
};

var verifyUserTOken = function (req, res, next) {
    console.log(req.path);
    //console.log(req.headers['x-access-token']);
    var token = req.headers['x-access-token'] || req.query.token || req.body.token;
    console.log(token);
    jwt.verify(token, 'supaSecretTokenDzenerejtor', function (err, decoded) {
        if (err) {
            console.error('invalid token');
            console.error(err);
            res.json({success: false, message: err.message});
        } else if (req.path === '/verifyToken') {
            res.json({success: true, message: 'Token is valid'});
        } else {
            req.user = decoded;
            next();
        }
    });

};


module.exports = {
    dateParser: dateParser,
    protectedUser: protectedUser,
    protectedAdmin: protectedAdmin,
    verifyUserTOken: verifyUserTOken
};

