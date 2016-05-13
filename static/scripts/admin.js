/**
 * Created by Wish Kaan on 26-Mar-16.
 */
$(function () {

    var protocol = $(location).attr('protocol');
    var host = $(location).attr('host');
    var url = protocol + '//' + host;
    var id;
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
                                '<td><button class="btn btn-default btn-xs editbtn pull-right">' +
                                '<span class="glyphicon glyphicon-pencil"></span> edit user details</button></td>' +
                                '<td><button class="btn btn-default btn-xs deletebtn pull-right">' +
                                '<span class="glyphicon glyphicon-remove"></span> delete user</button></td></tr>');

                            function addOne(id) {
                                var number = parseInt($(id).html());
                                return number + 1;
                            }

                            if (res.access_level === 'admin') {
                                $('p:contains("ADMIN") .usrcnt').text(addOne('p:contains("ADMIN") .usrcnt'));
                                $('#ttlcnt').text(addOne('#ttlcnt'));

                            } else if (res.access_level === 'user') {
                                var elemcheck = $('p:contains("USER") .usrcnt');
                                if (elemcheck.length === 0) {
                                    $('<p>USERS : <span class="usrcnt">1</span></p>').insertAfter('p:contains("ADMIN")');
                                    $('#ttlcnt').text(addOne('#ttlcnt'));

                                } else {

                                    $(elemcheck).text(addOne('p:contains("USER") .usrcnt'));
                                    $('#ttlcnt').text(addOne('#ttlcnt'));
                                }

                            } else {
                                console.error('nothing to add');
                            }
                            $('#ajaxsuccess').html('New User Created').fadeIn(10).delay(2000).fadeOut(2000);
                            $.bootstrapSortable(true);
                            $('#user-submit')[0].reset();
                            $('#usrfocus').focus();


                            //$('.usersDB').trigger('click');
                        }
                    }).fail(function (reason) {
                        console.error(reason)
                    });

                });
                $('.editbtn').on('click', function () {
                    var username = $(this).closest('tr').find('td:nth-child(2)').text();
                    var access = $(this).closest('tr').find('td:nth-child(4)').text();
                    id = $(this).closest('tr').find('td').first().text();

                    $('.usreditmodal input[name="username"]').val(username);

                    if (access === 'admin') {
                        $('.usreditmodal .admradio input[value="Admin"]').prop('checked', true);
                    } else if (access === 'user') {
                        $('.usreditmodal .usrradio input[value="User"]').prop('checked', true);
                    }
                    $('.usreditmodal').modal('show')

                });
                $('.usreditmodal').on('shown.bs.modal', function () {
                    $('.usreditmodal input[name="username"]').focus();
                });

                $('.usreditmodal .form-horizontal').on('submit', function (e) {
                    e.preventDefault();
                    var modal = $('.usreditmodal');
                    var data = $(this).serialize() + '&userID=' + id;
                    $(modal).modal('hide');
                    $(modal).on('hidden.bs.modal', function () {
                        $(this).find('form').trigger('reset');
                    });
                    console.log(data);
                    $.ajax({
                        type: 'POST',
                        url: url + '/editUser',
                        dataType: 'json',
                        data: data.toLowerCase()
                    }).done(function (res) {
                        console.log(res);
                        var findRow = $('.keyid').filter(function () {
                            return $(this).text() === res.userid;
                        });
                        $(findRow).parent().find('td:nth-child(2)').text(res.username);
                        $(findRow).parent().find('td:nth-child(4)').text(res.access_level);
                        $('#ajaxsuccess').html('User details updated').fadeIn(10).delay(2000).fadeOut(2000);


                    }).fail(function (reason) {
                        console.log(reason);
                    })

                });



            })

    });


});

