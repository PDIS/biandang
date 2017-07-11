$().ready(function () {
    addEnquetePreviewImageEvents();
    addEnqZoomingEvent();
    $('#cover', '#enq').click(function () {
        $('#imageView', '#enq').hide();
        $('#cover', '#enq').hide();
    });
    var $myName = $('#myName', '#enq');
    var isAnonymous = $myName.val() == '';
    $myName.on('change', function () {
        localStorage.setItem('myName', $('#myName').val());
    });
    var myName = localStorage.getItem('myName');
    if (myName) {
        $myName.val(myName);
        if (isAnonymous) {
            $.ajax({
                method: 'GET',
                url: '/getMyOrder?name=' + myName
            }).done(function (resp) {
                $('#myOrder').html($('#myOrder').html() + resp);
            });
        }
    }
    if (myName.length > 0) {
        $myName.attr('size', myName.length);
    }
    $('#send-order').button();
});

function addEnquetePreviewImageEvents() {
    $('.previewFrame', '#enq').click(function () {
        var $view = $('#imageView', '#enq');
        $view.children('img').attr('src', $(this).children('img').attr('src'));
        $view.show();
        $('#cover', '#enq').show();
    });
}

function isValidSendOrder() {
    var isHaveName = $('#myName', '#enq').val().trim().length > 0;
    if (!isHaveName) {
        $( "#no-name-hint" ).dialog({
            title: $('#myName', '#enq').attr('placeholder'),
            modal: true,
            buttons: {
                Ok: function() {
                    $( this ).dialog( "close" );
                }
            }
        });
    }
    var isValid = $('#order', '#enq').val().trim().length > 0;
    if (!isValid) {
        $( "#no-order-hint" ).dialog({
            title: $('#order', '#enq').attr('placeholder'),
            modal: true,
            buttons: {
                Ok: function() {
                    $( this ).dialog( "close" );
                }
            }
        });
    }
    return isValid && isHaveName;
}


function addEnqZoomingEvent() {
    var $div = $('#imageView', '#enq');
    $div.children('img').on('click', function (view) {
        $div.toggleClass('normal zoomed');
        $div.children('img').toggleClass('normal zoomed');
    });
}