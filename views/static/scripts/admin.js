/**
 * Created by Wish Kaan on 26-Mar-16.
 */
$(function () {

    var $protocol = $(location).attr('protocol');
    var $host = $(location).attr('host');
    var $url = $protocol + '//' + $host;
    var $id;
    var $handlerMount = $('#table-container');
    var $dTable;
    var $dTableSearchBox;
    var $dTableOptionsDefault = {
        fixedHeader: true,
        scrollY: '49.5vh',
        // scrollCollapse: true,
        ordering: true,
        info: true,
        columnDefs: [{
            targets: 'no-sort',
            orderable: false
        }]

    };
    var $wordsTableOptions = {
        order: [4, 'desc'],
        processing: true,
        serverSide: true,
        paging: true,
        deferRender: true,
        // dom: 'frtiS',
        scroller: {
            boundaryScale: 0.3,
            displayBuffer: 10,
            loadingIndicator: true
        },
        stateSave: true,
        ajax: {
            url: $url + '/dataRefresh',
            dataSrc: "aaData"
        },
        columns: [
            {
                data: 'entryid',
                className: 'wordsid hide'
            },
            {data: 'question'},
            {data: 'answer'},
            {data: 'created_by'},
            {data: 'created_at'},
            // {data: 'updated_by'},
            {
                data: 'is_approved',
                className: "text-center",
                // defaultContent: '<span class="glgood glyphicon glyphicon-ok"></span>'
                render: function (data, type, full, meta) {
                    "use strict";
                    if (data === 1) {
                        return '<span class="glgood glyphicon glyphicon-ok"></span>'
                    } else if (data === 0) {
                        return '<span class="glbad glyphicon glyphicon-remove"></span>'
                    } else {
                        return '<span></span>'
                    }
                }
            },
            {
                data: 'is_approved',
                // defaultContent: 'gg'
                // defaultContent: '<button class="btn btn-default btn-xs">dugmesce</button>'
                render: function (data, type, full, meta) {
                    if (data === 1) {
                        return '<div class="btn-toolbar pull-right">' +
                            '<button class="btn btn-success btn-xs approveword" disabled ="disabled">' +
                            '<span class="glyphicon glyphicon-thumbs-up"></span> approve' +
                            '</button>' +

                            '<button class="btn btn-warning btn-xs declineword">' +
                            '<span class="glyphicon glyphicon-thumbs-down"></span> decline' +
                            '</button>' +

                            '<button class="btn btn-primary btn-xs editwords" disabled ="disabled">' +
                            '<span class="glyphicon glyphicon-pencil"></span> edit' +
                            '</button>' +

                            '<button class="btn btn-danger btn-xs deletewords" disabled ="disabled">' +
                            '<span class="glyphicon glyphicon-remove"></span> delete' +
                            '</button>' +
                            '</div>'
                    } else if (data === 0) {
                        return '<div class="btn-toolbar pull-right">' +
                            '<button class="btn btn-success btn-xs approveword">' +
                            '<span class="glyphicon glyphicon-thumbs-up"></span> approve' +
                            '</button>' +

                            '<button class="btn btn-warning btn-xs declineword" disabled ="disabled">' +
                            '<span class="glyphicon glyphicon-thumbs-down"></span> decline' +
                            '</button>' +

                            '<button class="btn btn-primary btn-xs editwords">' +
                            '<span class="glyphicon glyphicon-pencil"></span> edit' +
                            '</button>' +

                            '<button class="btn btn-danger btn-xs deletewords">' +
                            '<span class="glyphicon glyphicon-remove"></span> delete' +
                            '</button>' +
                            '</div>'
                    } else {
                        return '<div class="btn-toolbar pull-right">' +
                            '<button class="btn btn-success btn-xs approveword">' +
                            '<span class="glyphicon glyphicon-thumbs-up"></span> approve' +
                            '</button>' +

                            '<button class="btn btn-warning btn-xs declineword">' +
                            '<span class="glyphicon glyphicon-thumbs-down"></span> decline' +
                            '</button>' +

                            '<button class="btn btn-primary btn-xs editwords">' +
                            '<span class="glyphicon glyphicon-pencil"></span> edit' +
                            '</button>' +

                            '<button class="btn btn-danger btn-xs deletewords">' +
                            '<span class="glyphicon glyphicon-remove"></span> delete' +
                            '</button>' +
                            '</div>'
                    }
                }
            }


        ]
    };
    var $userTableOptions = {
        scrollCollapse: true
    };
    var $approvedTableOptions = {
        scrollCollapse: true,
        order: [4, 'desc']
    };

    function joinOptObjects(options1, options2) {
        "use strict";
        return $.extend({}, options1, options2);
    }

    function usrCounterUpdate() {
        var $table = $('#usrtable');
        var $admins = $($table).find('td:nth-child(4):contains("admin")');
        var $users = $($table).find('td:nth-child(4):contains("user")');
        $('p:contains("ADMIN") .usrcnt').text($admins.length);
        $('p:contains("USER") .usrcnt').text($users.length);
        $('#ttlcnt').text($admins.length + $users.length);
    }

    function dataTableInit(table, options) {
        "use strict";
        //DataTables initialization
        $dTable = $(table).DataTable(options);

        //Limiting search box until at least 3 letters typed
        $dTableSearchBox = $(table + '_filter input');
        $dTableSearchBox.unbind();
        $dTableSearchBox.bind('input', function (e) {
            if (this.value.length >= 3) {
                $dTable.search(this.value).draw();
            }
            if (this.value == '') {
                $dTable.search('').draw();
            }
        });
    }

    $('.wordsDB').on('click', function (e) {
        e.preventDefault();
        localStorage.setItem('adminCurrentView', $(e.target).text());
        $.ajax({
            type: 'GET',
            url: $url + '/adminWordsFetch',
            dataType: 'html'

        }).done(function (res) {
            // console.log(res);
            //alert(res);
            $('#table-container').html(res);
            dataTableInit('#wrdstbl', joinOptObjects($dTableOptionsDefault, $wordsTableOptions));
            // setInterval(function () {
            //     $dTable.ajax.reload(null, false); // user paging is not reset on reload
            // }, 5000);
            // console.log($('thead tr:first').find('th').length);
            // console.log($('tbody tr:first').find('td').length);
            // setTimeout(function () {
            //     $dTable.ajax.url('/dataRefresh').load();
            // }, 1500)

        }).fail(function (xhr, status, error) {
            // console.log(xhr);
            alert(xhr.responseText + '\n\nClick OK to redirect');
            window.location.href = '/'
        })
    });

    $('.usersDB').on('click', function (e) {
        e.preventDefault();
        localStorage.setItem('adminCurrentView', $(e.target).text());
        $.ajax({
            type: 'GET',
            url: $url + '/adminUsersFetch',
            dataType: 'html'

        }).done(function (res) {
            //alert(res);
            $('#table-container').html(res);
            dataTableInit('#usrtable', joinOptObjects($dTableOptionsDefault, $userTableOptions));

        }).fail(function (xhr, status, error) {
            console.log(xhr);
            alert(xhr.responseText + '\n\nClick OK to redirect');
            window.location.href = '/'
        });
    });


    $('.approvedDB').on('click', function (e) {
        e.preventDefault();
        localStorage.setItem('adminCurrentView', $(e.target).text());
        $.ajax({
            type: 'GET',
            url: $url + '/adminApprovedFetch',
            dataType: 'html'

        }).done(function (res) {
            $('#table-container').html(res);
            dataTableInit('#approvedtbl', joinOptObjects($dTableOptionsDefault, $approvedTableOptions))

        }).fail(function (xhr, status, error) {
            console.log(xhr);
            alert(xhr.responseText + '\n\nClick OK to redirect');
            window.location.href = '/'
        });
    });


    $($handlerMount).on('submit', '#user-submit', function (e) {
        e.preventDefault();
        $.ajax({
            type: 'POST',
            url: $url + '/createUser',
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
                    '<td class="keyid hide">' + res.userid + '</td>' +
                    '<td>' + res.username + '</td>' +
                    '<td>' + res.created_at + '</td>' +
                    '<td>' + res.access_level + '</td>' +
                    '<td><div class="btn-toolbar pull-right"><button class="btn btn-primary btn-xs editbtn">' +
                    '<span class="glyphicon glyphicon-pencil"></span> edit user</button>' +
                    '<button class="btn btn-danger btn-xs deletebtn">' +
                    '<span class="glyphicon glyphicon-remove"></span> delete user</button></div></td></tr>');
                // $('#table-container').load('/adminUsersFetch' );
                if (res.access_level === 'user') {
                    var elemcheck = $('p:contains("USER") .usrcnt');
                    if (elemcheck.length === 0) {
                        $('<p>USERS : <span class="usrcnt">1</span></p>').insertAfter('p:contains("ADMIN")');
                    }
                }
                usrCounterUpdate();
                $('#ajaxsuccess').html('New User Created').fadeIn(10).delay(2000).fadeOut(2000);
                // $.bootstrapSortable(true);
                $('#user-submit')[0].reset();
                $('#usrfocus').focus();


                //$('.usersDB').trigger('click');


            }
        }).fail(function (xhr, status, error) {
            console.log(xhr);
            alert(xhr.responseText + '\n\nClick OK to redirect');
            window.location.href = '/'
        });

    });

    $($handlerMount).on('click', '.editbtn', function () {
        var $username = $(this).closest('tr').find('td:nth-child(2)').text();
        var access = $(this).closest('tr').find('td:nth-child(4)').text();
        $id = $(this).closest('tr').find('td').first().text();
        // console.log($id);

        $('.usreditmodal input[name="username"]').val($username);

        if (access === 'admin') {
            $('.usreditmodal .admradio input[value="admin"]').prop('checked', true);
        } else if (access === 'user') {
            $('.usreditmodal .usrradio input[value="user"]').prop('checked', true);
        }
        $('.usreditmodal').modal('show')

    });

    $('.usreditmodal').on('shown.bs.modal', function () {
        $('.usreditmodal input[name="username"]').focus();
    });

    $('.usreditmodal .form-horizontal').on('submit', function (e) {
        e.preventDefault();
        var modal = $('.usreditmodal');
        var data = $(this).serialize() + '&userid=' + $id;
        $(modal).modal('hide');
        $(modal).on('hidden.bs.modal', function () {
            $(this).find('form').trigger('reset');
        });
        $.ajax({
            type: 'POST',
            url: $url + '/editUser',
            dataType: 'json',
            data: data
        }).done(function (res) {
            // console.log(res);
            var findRow = $('.keyid').filter(function () {
                return $(this).text() === res.userid;
            });
            $(findRow).parent().find('td:nth-child(2)').text(res.username);
            $(findRow).parent().find('td:nth-child(4)').text(res.access_level);
            usrCounterUpdate();
            // $.bootstrapSortable(true);
            $('#ajaxsuccess').html('User details updated').fadeIn(10).delay(2000).fadeOut(2000);

        }).fail(function (xhr, status, error) {
            console.log(xhr);
            alert(xhr.responseText + '\n\nClick OK to redirect');
            window.location.href = '/'
        })

    });

    $($handlerMount).on('click', '.deletebtn', function () {
        $id = $(this).closest('tr').find('td').first().text();
        var $username = $(this).closest('tr').find('td:nth-child(2)').text();
        $('.deleteusrmodal #modalusrname strong').text($username);
        $('.deleteusrmodal').modal('show');
        // console.log($id);
    });

    $('#delete-confirmed').on('click', function () {
        $('.deleteusrmodal').modal('hide');
        $.ajax({
            type: 'DELETE',
            url: $url + '/deleteUser',
            dataType: 'JSON',
            data: {userid: $id}
        }).done(function (res) {
            // console.log(res);
            $('.keyid').filter(function () {
                return $(this).text() === res.userid;
            }).parent().remove();
            usrCounterUpdate();
            $('#ajaxsuccess').text('User Deleted!').fadeIn(50).delay(2500).fadeOut(800);
        }).fail(function (xhr, status, error) {
            console.log(xhr);
            alert(xhr.responseText + '\n\nClick OK to redirect');
            window.location.href = '/'
        })
    });

    $($handlerMount).on('click', '.editwords', function () {
        var $question = $(this).closest('tr').find('td:nth-child(2)').text();
        var $answer = $(this).closest('tr').find('td:nth-child(3)').text();
        var $createdBy = $(this).closest('tr').find('td:nth-child(4)').text();
        var $createdAt = $(this).closest('tr').find('td:nth-child(5)').text();
        $id = $(this).closest('tr').find('td').first().text();
        // console.log($id);

        $('.wordseditmodal input[name="question"]').val($question);
        $('.wordseditmodal input[name="answer"]').val($answer);
        $('.wordseditmodal #createdby strong').text($createdBy);
        $('.wordseditmodal #createdat').text($createdAt);

        $('.wordseditmodal').modal('show');
    });

    $('.wordseditmodal').on('shown.bs.modal', function () {
        $('.wordseditmodal input[name="question"]').focus();
    });

    $('.wordseditmodal .form-horizontal').on('submit', function (e) {
        e.preventDefault();
        var modal = $('.wordseditmodal');
        var data = $(this).serialize() + '&entryid=' + $id;
        $(modal).modal('hide');
        $(modal).on('hidden.bs.modal', function () {
            $(this).find('form').trigger('reset');
        });
        console.log(data);
        $.ajax({
            type: 'POST',
            url: $url + '/editWords',
            dataType: 'json',
            data: data
        }).done(function (res) {
            // console.log(res);
            var findRow = $('.wordsid').filter(function () {
                return $(this).text() === res.entryid;
            });
            $(findRow).parent().find('td:nth-child(2)').text(res.question);
            $(findRow).parent().find('td:nth-child(3)').text(res.answer);
            //$(findRow).parent().find('td:nth-child(6)').text(res.updated_by);
            // $.bootstrapSortable(true);
            $('#ajaxsuccess').html('Changes saved').fadeIn(10).delay(2000).fadeOut(2000);

        }).fail(function (xhr, status, error) {
            console.log(xhr);
            alert(xhr.responseText + '\n\nClick OK to redirect');
            window.location.href = '/';
        })

    });

    $($handlerMount).on('click', '.deletewords', function () {
        $id = $(this).closest('tr').find('td').first().text();
        var $question = $(this).closest('tr').find('td:nth-child(2)').text();
        var $answer = $(this).closest('tr').find('td:nth-child(3)').text();
        $('.deletewordsmodal #modalwordsquestion strong').text($question);
        $('.deletewordsmodal #modalwordsanswer strong').text($answer);
        $('.deletewordsmodal').modal('show');
        // console.log($id);
    });

    $('#words-delete-confirmed').on('click', function () {
        $('.deletewordsmodal').modal('hide');
        $.ajax({
            type: 'DELETE',
            url: $url + '/deleteWords',
            dataType: 'JSON',
            data: {entryid: $id}
        }).done(function (res) {
            // console.log(res);
            $('.wordsid').filter(function () {
                return $(this).text() === res.entryid;
            }).parent().remove();
            $('#ajaxsuccess').text('Row Deleted!').fadeIn(50).delay(2500).fadeOut(800);

        }).fail(function (xhr, status, error) {
            console.log(xhr);
            alert(xhr.responseText + '\n\nClick OK to redirect');
            window.location.href = '/'
        })
    });

    $($handlerMount).on('click', '.approveword', function () {
        $id = $(this).closest('tr').find('td').first().text();
        $(this).blur();
        // console.log($id);
        $.ajax({
            type: 'POST',
            url: $url + '/approveWords',
            dataType: 'JSON',
            data: {
                entryid: $id,
                is_approved: 1
            }
        }).done(function (res) {
            // console.log(res);
            var $findRow = $('.wordsid').filter(function () {
                return $(this).text() === res.entryid;
            });
            var $tr = $($findRow).closest('tr');
            $($tr).find('td:nth-child(6)').attr('data-real-value', '1');
            $($tr).find('td:nth-child(6) span').removeClass().addClass("glgood glyphicon glyphicon-ok");
            $($tr).find('.approveword, .deletewords, .editwords').attr('disabled', 'disabled');
            $($tr).find('.declineword').removeAttr('disabled');

            $('#ajaxsuccess').text('Words Approved!').show(0).fadeIn(50).delay(2500).fadeOut(800).hide(0);
        }).fail(function (xhr, status, error) {
            console.log(xhr);
            alert(xhr.responseText + '\n\nClick OK to redirect');
            window.location.href = '/'
        });

    });

    $($handlerMount).on('click', '.declineword', function () {
        $id = $(this).closest('tr').find('td').first().text();
        $(this).blur();
        // console.log($id);
        $.ajax({
            type: 'POST',
            url: $url + '/approveWords',
            dataType: 'JSON',
            data: {
                entryid: $id,
                is_approved: 0
            }
        }).done(function (res) {
            // console.log(res);
            var $findRow = $('.wordsid').filter(function () {
                return $(this).text() === res.entryid;
            });
            var activeTab = localStorage.getItem('adminCurrentView');
            $($findRow).closest('tr').find('td:nth-child(6)').attr('data-real-value', '0');
            $($findRow).closest('tr').find('td:nth-child(6) span').removeClass().addClass("glbad glyphicon glyphicon-remove");
            $($findRow).closest('tr').find('.approveword, .deletewords, .editwords').removeAttr('disabled');
            if (activeTab === 'Approved Words View') {
                $($findRow).parent().remove()
            }
            $($findRow).closest('tr').find('.declineword').attr('disabled', 'disabled');

            $('#ajaxsuccess').text('Words Declined!').show(0).fadeIn(50).delay(2500).fadeOut(800).hide(0);

        }).fail(function (xhr, status, error) {
            console.log(xhr);
            alert(xhr.responseText + '\n\nClick OK to redirect');
            window.location.href = '/'
        });

    });

    var filterApproved = function (fieldValue) {
        return $('.wordsid').closest('tr').find('td:nth-child(7)').filter(function () {
            return $(this).attr('data-real-value') === fieldValue
        }).parent()
    };

    $($handlerMount).on('click', '.dropdown li a', function () {
        console.log($(this).text());
        localStorage.setItem('last_Field', $(this).text());
        var $tbody = $('table tbody');
        var $dropButton = $(this).parent().parent().siblings();
        $($tbody).find('tr').hide();

        if (/All/.test($(this).text())) {
            $($tbody).find('tr').show();
            $($dropButton).html('All<span class="caret"></span>');

        } else if (/Approved/.test($(this).text())) {
            $($tbody).find(filterApproved('1')).show();
            $($dropButton).html('Approved<span class="caret"></span>')

        } else if (/Declined/.test($(this).text())) {
            $($tbody).find(filterApproved('0')).show();
            $($dropButton).html('Declined<span class="caret"></span>');


        } else if (/Unmarked/.test($(this).text())) {
            $($tbody).find(filterApproved('unmarked')).show();
            $($dropButton).html('Unmarked<span class="caret"></span>');

        }
    })

});


