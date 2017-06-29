$().ready(function () {
    addEnquetePreviewImageEvents();
    $('#enq #cover').click(function () {
        $('#enq #imageView').hide();
        $('#enq #cover').hide();
    });
    $('#myName').on('change', function () {
        localStorage.setItem('myName', $('#myName').val());
    });
    var myName = localStorage.getItem('myName');
    if (myName) {
        $('#myName').val(myName);
    }
});

function addEnquetePreviewImageEvents() {
    $('#enq .previewFrame').click(function () {
        var $view = $('#enq #imageView');
        $view.children('img').attr('src', $(this).children('img').attr('src'));
        $view.show();
        $('#enq #cover').show();
    });
}

function isValidSendOrder() {
    var isValid = $('#enq #order').val().trim().length > 0;
    if (!isValid) {
        alert("你還沒點餐喔！");
    }
    return isValid;
}