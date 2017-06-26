$().ready(function () {
    addEnquetePreviewImageEvents();
    $('#enq #cover').click(function () {
        $('#enq #imageView').hide();
        $('#enq #cover').hide();
    });
    // $(window).load(verticallyCenterImage);
    // $(window).resize(verticallyCenterImage);
});

function addEnquetePreviewImageEvents() {
    $('#enq .previewFrame').click(function () {
        var $view = $('#enq #imageView');
        $view.children('img').attr('src', $(this).children('img').attr('src'));
        $view.show();
        console.log($('#enq'))
        $('#enq #cover').show();
    });
}

// function verticallyCenterImage(){
//     var $img = $('#enq #imageView img'),
//         windowHeight = $(window).outerHeight();
//
//     if($img.height() < windowHeight){
//         var delta = windowHeight - $img.height();
//         $img.css('margin-top', (delta / 2) + 'px');
//     }else{
//         $img.attr('style', '');
//     }
// }

function isValidUpload() {
    var isValid = $('#enq #order').val().trim().length > 0;
    if (!isValid) {
        alert("你還沒點餐喔！");
    }
    return isValid;
}