$().ready(function () {
    var lastTab = localStorage.getItem('last_tab');
    if (!lastTab) lastTab = 0;
    $('#tabs').tabs({
        active: lastTab,
        activate: function (event, ui) {
            localStorage.setItem('last_tab', ui.newTab.index());
        }
    });
    $('button').button();
});
