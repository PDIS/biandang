var timeoutId;

$().ready(function () {
    addManagePreviewImageEvents();
    $('#man #cover').click(function () {
        $('#man #imageView').hide();
        $('#man #cover').hide();
    });
    $('#man #deleteImage').click(function (e) {
        deleteImage($(this));
        e.stopPropagation();
    });
    $('#man #edit_description').on('input', function () {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(function () {
            // Runs 1 second (1000 ms) after the last change
            saveDescToDB();
        }, 1000);
    });
});

function addManagePreviewImageEvents() {
    $('#man .previewFrame').click(function () {
        var $view = $('#man #imageView');
        $view.children('img').attr('src', $(this).children('img').attr('src'));
        $view.show();
        $('#man #cover').show();
    });
}

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
            window.location.href = '/';
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
        $('.images').html(html);
        addManagePreviewImageEvents();
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
            data: $('#edit_description').val()
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
        $('div#description').html($('#edit_description').val());
    }).fail(function (err) {
        $('#saving').css('color', 'red');
        $('#saving').html('儲存錯誤！');
        setTimeout(function () {
            $('#saving').fadeOut(300);
        }, 2000);
    });
}

function isValidUpload() {
    var isValid = $('#filesToUpload').val().trim().length > 0;
    if (!isValid) {
        alert("No file is selected!");
    }
    return isValid;
}