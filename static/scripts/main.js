/**
 * Created by Wish Kaan on 20-Mar-16.
 */
$(function () {
    var protocol = $(location).attr('protocol');
    var host = $(location).attr('host');
    var url = protocol + '//' + host;
    console.log(url);

    $("#messages").delay(2500).fadeOut(800);
    $('.blink:first-child').animate({opacity: 0.40}, 150, "linear", function () {
        $(this).delay(100).animate({opacity: 1}, 400);
    });


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
    $('.deletebtn').on('click', function () {
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
                url: url + '/deleteRow',
                data: {
                    entryId: rowId
                }
            })
            .done(function (res) {
//                    alert(res);
                $('.keyid').filter(function () {
                    return $(this).text() === res;
                }).parent().remove();
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

    $('.editbtn').on('click', function adder() {
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
        $('.editbtn').off('click', adder);


        $('.edit-cell').children().keypress(function (e) {
            if (e.which == 13) {

                var newContentQ = $(selectQ).children().first().val();
                var newContentA = $(selectA).children().first().val();
                if (newContentQ !== originalQuestion || newContentA !== originalAnswer) {
//                    alert('ajax call');
                    $.ajax({
                        type: 'POST',
                        url: url + '/editRow',
                        data: {
                            entryId: rowId,
                            question: newContentQ,
                            answer: newContentA
                        },
                        success: function (res) {
                            var res = JSON.parse(res);
//                            alert(res.question);
                            var rowWrite = $('.keyid').filter(function () {
                                return $(this).text() === res.entryId;
                            });

                            $(rowWrite).parent().find('td:nth-child(3)').text(res.question);
                            $(rowWrite).parent().find('td:nth-child(4)').text(res.answer);
                            $(selectQ).add(selectA).removeClass("edit-cell");
                            $('.editbtn').on('click', adder);
                            handlerActive = false;
                            $('#ajaxsuccess').text('Update Successful').fadeIn(50).delay(2500).fadeOut(800);

                        }
                    })
                } else {
                    $(selectQ).text(newContentQ);
                    $(selectA).text(newContentA);
                    $(selectQ).add(selectA).removeClass("edit-cell");
                    $('.editbtn').on('click', adder);
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
                        $('.editbtn').on('click', adder);
                    }
                }, 5);
            }

        })

    });


});



