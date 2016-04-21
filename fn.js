/**
 * Created by Wish Kaan on 04-Apr-16.
 */
var moment = require('moment');


//parsing dates to more readable format in views
var dateParser = function (obj) {
    var date = obj.toJSON();
    if (date.created_at && date.created_by) {
        date.created_at = moment(date.created_at).format('DD-MMM-YYYY  HH:mm:ss');
        date.created_by = moment(date.created_by).format('DD-MMM-YYYY  HH:mm:ss');
        return date
    } else if (date.created_at) {
        date.created_at = moment(date.created_at).format('DD-MMM-YYYY  HH:mm:ss');
        return date
    } else {
        date.created_by = moment(date.created_by).format('DD-MMM-YYYY  HH:mm:ss');
        return date
    }
};

//use on routes that require user level access
var protectedUser = function (req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/signin');
    } else {
        next();
    }
};

//use on routes that require admin level access
var protectedAdmin = function (req, res, next) {
    var user = req.user.toJSON();
    if (!req.isAuthenticated() || user.access_level !== 'admin') {
        res.end('UNAUTHORIZED!\nPlease log in');
    } else {
        next();
    }
};


module.exports = {
    dateParser: dateParser,
    protectedUser: protectedUser,
    protectedAdmin: protectedAdmin
};

