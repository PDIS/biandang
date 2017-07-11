$().ready(function () {
    $('#confirm-clear').dialog({
        autoOpen: false,
        resizable: false,
        height: "auto",
        width: 400,
        modal: true
    });
});

function clearOrders() {
    $('#confirm-clear').dialog({
        buttons: {
            "Yes": function () {
                $.ajax({
                    method: 'POST',
                    url: '/clearOrders'
                }).done(function () {
                    window.location.href = '/';
                });
                $(this).dialog("close");
            },
            "No": function () {
                $(this).dialog("close");
            }
        }
    });
    $('#confirm-clear').dialog('open');
}

function refresh() {
    window.location.href = '/';
}