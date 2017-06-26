$().ready(function () {
    $('.tablinks').on('click', function () {
        $('.tabcontent').hide();
        $('.tablinks').removeClass('active');
        var index = $(this).index();
        $(this).addClass('active');
        $('.tabcontent').eq(index).show();
        localStorage.setItem('last_tab', index);
    });
    var lastTab = localStorage.getItem('last_tab');
    if (!lastTab) lastTab = 0;
    $('.tablinks').eq(lastTab).addClass('active');
    $('.tabcontent').eq(lastTab).show();
});
