$().ready(function () {
    addPreviewImageEvents();
    $('#cover').click(function () {
        $('#imageView').hide();
        $('#cover').hide();
    });
    $(window).load(verticallyCenterImage);
    $(window).resize(verticallyCenterImage);
});

function addPreviewImageEvents() {
    $('.previewFrame').click(function () {
        var $view = $('#imageView');
        $view.children('img').attr('src', $(this).children('img').attr('src'));
        $view.show();
        $('#cover').show();
    });
}

function verticallyCenterImage(){
    var $img = $('#imageView img'),
        windowHeight = $(window).outerHeight();

    if($img.height() < windowHeight){
        var delta = windowHeight - $img.height();
        $img.css('margin-top', (delta / 2) + 'px');
    }else{
        $img.attr('style', '');
    }
}

function isValidUpload() {
    var isValid = $('#order').val().trim().length > 0;
    if (!isValid) {
        alert("你還沒點餐喔！");
    }
    return isValid;
}