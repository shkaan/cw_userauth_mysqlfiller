/**
 * Created by Wish Kaan on 26-Mar-16.
 */
$(function () {
    $('.wordsDB').on('click', function (e) {
        e.preventDefault();
        $.ajax({
            type: 'GET',
            url: 'http://localhost:3000/adminWordsFetch',
            dataType: 'html'

        }).done (function (res) {
            //alert(res);
            $('#table-container').html(res);

        })
    });
    $('.usersDB').on('click', function (e) {
        e.preventDefault();
        $.when($.ajax({
            type: 'GET',
            url: 'http://localhost:3000/adminUsersFetch',
            dataType: 'html'

        })).done (function (res) {
            //alert(res);
            $('#table-container').html(res);
            console.log('radi do jaja');

        }).fail(function (reason) {
                console.log(reason)
            })
            .then(function () {
                $('#user-submit').on('submit', function (e) {
                    e.preventDefault();
                    $.ajax({
                        type: 'POST',
                        url: 'http://localhost:3000/testRoute',
                        dataType: 'json',
                        data: $("#user-submit").serialize()
                    }).done(function (res) {
                        //console.log(res.status);
                        if (res.status === 'exists') {
                            $('#ajaxfail').html('Username already exists').fadeIn(10).delay(1000).fadeOut(2000);
                        } else {
                            console.log(res);
                            $('.table tbody').append(
                                '<tr>' +
                                '<td>' + res.username + '</td>' +
                                '<td>' + res.password + '</td>' +
                                '<td>' + res.created_at + '</td>' +
                                '<td>' + res.access_level + '</td>' +
                                '/tr>');
                            $('#ajaxsuccess').html('New User Created').fadeIn(10).delay(1000).fadeOut(2000);
                            //$('.usersDB').trigger('click');
                        }
                        //$('#table-container').html(res);
                    }).fail(function (reason) {
                        alert(reason)
                    });

                })
            })

    });


});

