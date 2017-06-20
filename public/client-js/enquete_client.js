$().ready(function () {
    addPreviewImageEvents();
    $('#cover').click(function () {
        $('#imageView').hide();
        $('#cover').hide();
    });
});

function addPreviewImageEvents() {
    $('.previewInList').click(function () {
        var $view = $('#imageView');
        $view.children('img').attr('src', $(this).attr('src'));
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

$(window).load(verticallyCenterImage);
$(window).resize(verticallyCenterImage);
