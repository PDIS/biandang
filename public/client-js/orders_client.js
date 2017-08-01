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
    setupPriceList();
});

function clearOrders() {
    var $dialog = $('#confirm-clear');
    $dialog.dialog({
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
    $dialog.dialog('open');
}

function deleteSelectedOrders() {
    $('.delete-order').each(function (i, ele) {
        if ($(ele).is(':checked')) {
            var name = $(ele).parent().next('td').text();
            $.ajax({
                method: 'DELETE',
                url: 'order/' + encodeURIComponent(name)
            }).done(function () {
                window.location.href = '/';
            });
        }
    });
}

function refresh() {
    window.location.href = '/';
}

function setupOrderList() {
    $('.paid').on('change', function (ev) {
        var $e = $(ev.target);
        var name = $e.parent().siblings('td').eq(1).text();
        $.ajax({
            method: $e.is(':checked') ? 'PUT' : 'DELETE',
            url: 'pay/' + encodeURIComponent(name)
        });
    });
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
                order: value,
                getPriceList: true
            }
        }).done(function (resp) {
            var $table = $('#prices');
            $table.replaceWith(resp);
            setupPriceList();
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

var gInputingPrice;

function setupPriceList() {
    var $price = $('.price');
    $price.on('focus', function (ev) {
        var $e = $(ev.target);
        gInputingPrice = $e.text();
    }).on('blur', function (ev) {
        var $e = $(ev.target);
        var key = $e.prev('td').prev('td').html();
        var value = $e.text();
        $.ajax({
            method: 'POST',
            url: '/setPrice',
            data: {
                menu: key,
                price: value
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