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


module.exports = {
    dateParser: dateParser
};

