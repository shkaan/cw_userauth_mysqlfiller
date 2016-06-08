/**
 * Created by Wish Kaan on 04-Apr-16.
 */
var moment = require('moment');


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


module.exports = {
    dateParser: dateParser,
    protectedUser: protectedUser,
    protectedAdmin: protectedAdmin
};

