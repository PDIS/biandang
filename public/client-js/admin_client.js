$().ready(function () {
    $('.tablinks').on('click', function () {
        $('.tabcontent').hide();
        $('.tablinks').removeClass('active');
        var index = $(this).index();
        $(this).addClass('active');
        $('.tabcontent').eq(index).show();
    });
    // FIXME: Remember last tab
    $('.tablinks').eq(0).addClass('active');
    $('.tabcontent').eq(0).show();
});
