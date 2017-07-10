$().ready(function () {
    addEnquetePreviewImageEvents();
    addEnqZoomingEvent();
    $('#enq #cover').click(function () {
        $('#enq #imageView').hide();
        $('#enq #cover').hide();
    });
    var isAnonymous = $('#myName').val() == '';
    $('#myName').on('change', function () {
        localStorage.setItem('myName', $('#myName').val());
    });
    var myName = localStorage.getItem('myName');
    if (myName) {
        $('#myName').val(myName);
        if (isAnonymous) {
            $.ajax({
                method: 'GET',
                url: '/getMyOrder?name=' + myName
            }).done(function (resp) {
                $('#myOrder').html($('#myOrder').html() + resp);
            });
        }
    }
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
        alert("請輸入你的名字！");
    }
    var isValid = $('#order', '#enq').val().trim().length > 0;
    if (!isValid) {
        alert("你還沒點餐喔！");
    }
    return isValid && isHaveName;
}


function addEnqZoomingEvent() {
    var $div = $('#imageView', '#enq');
    $div.on('click', function (view) {
        $div.toggleClass('normal zoomed');
        $div.children('img').toggleClass('zoomed');
    });
}