var timeoutId;

$().ready(function () {
    addPreviewImageEvents();
    $('#cover').click(function () {
        $('#imageView').hide();
        $('#cover').hide();
    });
    $('#deleteImage').click(function (e) {
        deleteImage($(this));
        e.stopPropagation();
    });
    $('#description').on('input', function() {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(function() {
            // Runs 1 second (1000 ms) after the last change
            saveDescToDB();
        }, 1000);
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

function addImageUrl() {
    var url = encodeURIComponent($('#image_url').val());
    if (url.trim().length == 0) {
        alert('請輸入圖片網址！'); // FIXME: Change to jQuery UI alert box generated by server with i18n
        return;
    }
    $.ajax({
        method: 'PUT',
        url: '/imageUrl/' + url
    })
        .done(function (html) {
            $('#images').empty();
            console.log(html);
            $('#images').html(html);
            addPreviewImageEvents();
        });
}

function deleteImage($img) {
    if (!confirm('確定要刪除圖片？')) {
        return;
    }
    var imgUrl = encodeURIComponent($('#imageView').children('img').attr('src'));
    $.ajax({
        method: 'DELETE',
        url: '/imageUrl/' + imgUrl
    }).done(function (html) {
        $('#imageView').hide();
        $('#cover').hide();
        $('#images').html(html);
        addPreviewImageEvents();
    });
}

function saveDescToDB() {
    var savingId;
    $('#saving').css('color', 'green')
        .html('儲存中...')
        .show();
    savingId = setTimeout(function () {
        $('#saving').fadeOut(300);
    }, 2000);
    $.ajax({
        method: 'POST',
        url: '/description',
        data: {
            data: $('#description').val()
        }
    }).done(function (resp) {
        clearTimeout(savingId);
        if (resp == 'OK') {
            $('#saving').html('已儲存');
            setTimeout(function () {
                $('#saving').fadeOut(300);
            }, 2000);
        } else {
            $('#saving').css('color', 'red');
            $('#saving').html('儲存錯誤！');
            setTimeout(function () {
                $('#saving').fadeOut(300);
            }, 2000);
        }
    }).fail(function (err) {
        $('#saving').css('color', 'red');
        $('#saving').html('儲存錯誤！');
        setTimeout(function () {
            $('#saving').fadeOut(300);
        }, 2000);
    });
}