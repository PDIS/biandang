$().ready(function () {
    $('.tablinks').on('click', function () {
        $('.tabcontent').hide();
        $('.tablinks').removeClass('active');
        var index = $(this).index();
        console.log('i='+index);
        $(this).addClass('active');
        $('.tabcontent').eq(index).show();
    });
});
