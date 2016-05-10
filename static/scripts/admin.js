/**
 * Created by Wish Kaan on 26-Mar-16.
 */
$(function () {

    var protocol = $(location).attr('protocol');
    var host = $(location).attr('host');
    var url = protocol + '//' + host;
    console.log(url);


    $('.wordsDB').on('click', function (e) {
        e.preventDefault();
        $.ajax({
            type: 'GET',
            url: url + '/adminWordsFetch',
            dataType: 'html'

        }).done(function (res) {
            //alert(res);
            $('#table-container').html(res);
            $.bootstrapSortable(true);
        })
    });
    $('.usersDB').on('click', function (e) {
        e.preventDefault();
        $.when($.ajax({
            type: 'GET',
            url: url + '/adminUsersFetch',
            dataType: 'html'

        })).done(function (res) {
            //alert(res);
            $('#table-container').html(res);
            //console.log('radi do jaja');
            $.bootstrapSortable(true);

        }).fail(function (reason) {
                console.log(reason)
            })
            .then(function () {
                $('#user-submit').on('submit', function (e) {
                    e.preventDefault();
                    $.ajax({
                        type: 'POST',
                        url: url + '/createUser',
                        dataType: 'json',
                        data: $("#user-submit").serialize()
                    }).done(function (res) {
                        //console.log(res.status);
                        if (res.status === 'exists') {
                            $('#ajaxfail').html('Username already exists').fadeIn(10).delay(1000).fadeOut(2000);
                        } else {
                            //console.log(res);
                            $('.table tbody').append(
                                '<tr>' +
                                '<td>' + res.username + '</td>' +
                                '<td>' + res.created_at + '</td>' +
                                '<td>' + res.access_level + '</td>' +
                                '/tr>');
                            function addOne(id) {
                                var number = parseInt($(id).html());
                                return number + 1;
                            }

                            if (res.access_level === 'admin') {
                                $('#admincnt').text(addOne('#admincnt'));
                                $('#totalcnt').text(addOne('#totalcnt'));

                            } else if (res.access_level === 'user') {
                                $('#usercnt').text(addOne('#usercnt'));
                                $('#totalcnt').text(addOne('#totalcnt'));

                            } else {
                                console.error('nothing to add');
                            }

                            $('#ajaxsuccess').html('New User Created').fadeIn(10).delay(2000).fadeOut(2000);
                            $.bootstrapSortable(true);
                            $('#user-submit')[0].reset();
                            $('#usrfocus').focus();
                            //$('.usersDB').trigger('click');
                        }
                        //$('#table-container').html(res);
                    }).fail(function (reason) {
                        console.error(reason)
                    });

                })
            })

    });


});

