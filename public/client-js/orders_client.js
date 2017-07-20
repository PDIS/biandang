var gInputingTd = '';

$().ready(function () {
    $('#confirm-clear').dialog({
        autoOpen: false,
        resizable: false,
        height: "auto",
        width: 400,
        modal: true
    });
    setupOrderList();
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

function setupOrderList() {
    var $td = $('td.order[contenteditable]');
    $td.on('focus', function (ev) {
        var $e = $(ev.target);
        gInputingTd = $e.html();
    }).on('blur', function (ev) {
        var $e = $(ev.target);
        var key = $e.prev('td').html();
        var value = $e.html();
        $.ajax({
            method: 'POST',
            url: '/order',
            data: {
                myName: key,
                order: value
            }
        });
    }).on('keypress', function (ev) {
        var $e = $(ev.target);
        switch (ev.keyCode || ev.which) {
            case 13:
                $e.blur();
                return false;
        }
    }).on('keyup', function (ev) {
        var $e = $(ev.target);
        switch (ev.keyCode || ev.which) {
            case 27:
                $e.html(gInputingTd);
                $e.blur();
                break;
        }
    });
}