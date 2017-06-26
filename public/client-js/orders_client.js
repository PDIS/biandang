function clearOrders() {
    if (confirm('真的要清除點餐資料？一經清除便無法復原！')) {
        $.ajax({
            method: 'POST',
            url: '/clearOrders'
        }).done(function () {
            window.location.href = '/';
        });
    }
}
