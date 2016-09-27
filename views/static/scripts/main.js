/**
 * Created by Wish Kaan on 20-Mar-16.
 */
$(function () {

    var $protocol = $(location).attr('protocol');
    var $host = $(location).attr('host');
    var $url = $protocol + '//' + $host;
    var $id;
    var $handlerMount = $('.table-scroll');
    // var $lng = $('#table-body-recent').find('tr').length;
    var $dTableOptionsDefault = {
        fixedHeader: false,
        paging: true,
        scrollY: '50vh',
        // scrollCollapse: true,
        ordering: true,
        info: true,
        order: [4, 'desc'],
        columnDefs: [{
            targets: 'no-sort',
            orderable: false
        }],
        processing: true,
        serverSide: true,
        deferRender: true,
        stateSave: true,
        scroller: {
            boundaryScale: 0.3,
            displayBuffer: 10,
            loadingIndicator: true
        },
        ajax: {
            url: $url + '/indexData',
            dataSrc: "aaData"
        },
        columns: [
            {
                data: 'entryid',
                className: 'keyid hide'
            },
            {data: 'indexField'},
            {data: 'question'},
            {data: 'answer'},
            {data: 'created_at'},
            {
                defaultContent: '<div class="btn-toolbar pull-right">' +
                '<button class="btn btn-default btn-xs editbtn">' +
                '<span class="glyphicon glyphicon-pencil">' +
                '</span> edit row</button>' +
                '<button class = "btn btn-default btn-xs deletebtn" >' +
                '<span class = "glyphicon glyphicon-remove">' +
                '</span > delete row</button ></div >'
            }
        ]
    };

    var $dTblInit = $('#index-table').DataTable($dTableOptionsDefault);

    // setInterval(function () {
    //     $dTblInit.ajax.url($url + '/indexData').load(); // user paging is not reset on reload
    // }, 5000);

    // $('.table').on('draw.dt', function () {
    //     $(this).find('tr').addClass('blink');
    //     console.log('Redraw occurred at: ' + new Date().getTime());
    //
    //     $('tbody .blink:first-child').animate({opacity: 0.40}, 150, 'linear', function () {
    //         $(this).delay(100).animate({opacity: 1}, 400);
    //     });
    // });

    // $dTblInit.on('order.dt search.dt', function () {
    //     $dTblInit.column(1, {search: 'applied', order: 'applied'}).nodes().each(function (cell, i) {
    //         cell.innerHTML = i + 1;
    //     });
    // }).draw();

    console.log($url);

    $('#messages').show(0).delay(2500).fadeOut(800).hide(0);

    $('.table').on('draw.dt', function () {
        "use strict";
        if ($id) {
            $('.keyid').filter(function () {
                return $(this).text() === $id.toString();
            }).parent().animate({opacity: 0.40}, 150, 'linear', function () {
                $(this).delay(100).animate({opacity: 1}, 400);
                $id = null;
            });
        }
    });


    $('#idx-form').on('submit', function (e) {
        e.preventDefault();
        $.ajax({
            type: 'POST',
            url: $url + '/',
            dataType: 'JSON',
            data: $('#idx-form').serialize()
        }).done(function (res) {
            //console.log(res);
            $dTblInit.ajax.reload();
            $('#idx-form')[0].reset();
            $('#question-input').focus();
            if (res.error === false) {
                $('#messages').show(0).delay(2500);
                $('#info').html(res.message).fadeIn(10).delay(1500).fadeOut(2000);
                $id = res.xData;
            } else {
                $('#messages').show(0).delay(2500);
                $('#error').html(res.message).fadeIn(10).delay(1500).fadeOut(2000);
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            alert('Error occured\n' + jqXHR.status + '\n' + errorThrown +
                '\n\n' + 'Try refreshing this page')
        })
    });

    // $('.reverserec').each(function () {
    //     $(this).text($lng);
    //     $lng--
    // });


//        To prevent the page flashing on the first tab and then the tab that was saved by the cookie
// (this occurs when you determine the class "active" by default in the first TAB)
//
//        Remove the class "active" of tabs and panes like:
//
//                <ul class="nav nav-tabs">
//                <div id="p1" class="tab-pane">
//                Put the script below to set first tab like default


    $('a[data-toggle="pill"]').on('shown.bs.tab', function (e) {
        //save the latest tab using a cookie:
        $.fn.dataTable
            .tables({visible: true, api: true})
            .columns.adjust();
        localStorage.setItem('last_tab', $(e.target).attr('href'));
    });
    //activate latest tab, if it exists:
    var lastTab = localStorage.getItem('last_tab');
    if (lastTab) {
        $('a[href=' + lastTab + ']').tab('show');
    }
    else {
        // Set the first tab if cookie do not exist
        $('a[data-toggle="pill"]:first').tab('show');
    }


    //    DELETE AJAX EVENT
    //    AJAX post data when delete button is clicked, remove row after response
    $($handlerMount).on('click', '.deletebtn', function () {
        var deleteRowId = $(this).closest('tr').find('td:first').text();
        $('#delete-confirmed').attr('data-id', deleteRowId);
        $('.deletemodal').modal('show')
    });

    $('#delete-confirmed').on('click', function (e) {
        var rowId = $(e.target).attr('data-id');
        console.log(rowId);
        $('.deletemodal').modal('hide');

        $.ajax({
            type: 'POST',
            url: $url + '/deleteRow',
            data: {
                entryid: rowId
            }
        })
            .done(function (res) {
//                    alert(res);
//                 $('.keyid').filter(function () {
//                     return $(this).text() === res;
//                 }).parent().remove();
                $dTblInit.ajax.reload(null, false);
                $('#ajaxsuccess').text('Row Deleted!').fadeIn(50).delay(2500).fadeOut(800);
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                alert('Error occured\n' + jqXHR.status + '\n' + errorThrown +
                    '\n\n' + 'Try refreshing this page')
            })
    });

    $('.deletemodal').on('hidden.bs.modal', function () {
        $('#delete-confirmed').removeAttr('data-id');

    });
//            var answer = $(this).closest('tr').find('td:nth-child(3)').text();
//            $(this).closest('tr').css({ 'color': 'red'});


    //AJAX EDIT BUTTON EVENT
    //when edit button is clicked select q&a fields, transform td's into input fields, preserve old data
    //and if anything changed send via ajax
    //update table data on response

    $($handlerMount).on('click', '.editbtn', function adder() {
        var handlerActive = true;
        var rowId = $(this).closest('tr').find('td:first').text();
        var originalQuestion = $(this).closest('tr').find('td:nth-child(3)').text();
        var originalAnswer = $(this).closest('tr').find('td:nth-child(4)').text();
        var selectQ = $(this).closest('tr').find('td:nth-child(3)');
        var selectA = $(this).closest('tr').find('td:nth-child(4)');
//        alert(originalQuestion);
//        alert(originalAnswer);
        $(selectQ).add(selectA).addClass("edit-cell");
        $(selectQ).html("<input type='text' value='" + originalQuestion + "' />");
        $(selectA).html("<input type='text' value='" + originalAnswer + "' />");
        $(selectQ).children().first().focus();
        $($handlerMount).off('click', '.editbtn', adder);


        $('.edit-cell').children().keypress(function (e) {
            if (e.which == 13) {

                var newContentQ = $(selectQ).children().first().val();
                var newContentA = $(selectA).children().first().val();
                if (newContentQ !== originalQuestion || newContentA !== originalAnswer) {
//                    alert('ajax call');
                    $.ajax({
                        type: 'POST',
                        url: $url + '/editRow',
                        data: {
                            entryid: rowId,
                            question: newContentQ,
                            answer: newContentA
                        },
                        success: function (res) {
                            var data = JSON.parse(res);
//                            alert(res.question);
                            var rowWrite = $('.keyid').filter(function () {
                                return $(this).text() === data.entryid;
                            });
                            console.log(rowWrite);

                            $(rowWrite).parent().find('td:nth-child(3)').text(data.question);
                            $(rowWrite).parent().find('td:nth-child(4)').text(data.answer);
                            $(selectQ).add(selectA).removeClass("edit-cell");
                            $($handlerMount).on('click', '.editbtn', adder);
                            handlerActive = false;
                            $('#ajaxsuccess').text('Update Successful').fadeIn(50).delay(2500).fadeOut(800);

                        }
                    })
                } else {
                    $(selectQ).text(newContentQ);
                    $(selectA).text(newContentA);
                    $(selectQ).add(selectA).removeClass("edit-cell");
                    $($handlerMount).on('click', '.editbtn', adder);
                    handlerActive = false;
                    $('#ajaxsuccess').text('Nothing changed').fadeIn(50).delay(2500).fadeOut(800);
                }

            }
        });

        $(document).on('click', function remover() {
            if (handlerActive) {
                setTimeout(function () {
                    if (!selectQ.children().is(':focus') && !selectA.children().is(':focus')) {
                        $(selectQ).text(originalQuestion);
                        $(selectA).text(originalAnswer);
                        $(selectQ).add(selectA).removeClass("edit-cell");
                        $(document).off('click', remover);
                        $($handlerMount).on('click', '.editbtn', adder);
                    }
                }, 5);
            }

        });
//
    });


});



