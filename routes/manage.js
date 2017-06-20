var express = require('express');
var router = express.Router();
var sprintf = require("sprintf-js").sprintf;
var levelup = require('levelup');
var fs = require('fs');

router.get('/', function(req, res, next) {
    db.get('description', function (err, value) {
        var desc = '';
        if (!(err && err.notFound)) {
            desc = value;
        }
        generateImagesHTML(null, function (imagesHTML) {
            res.render('manage', {
                'imagesHTML': imagesHTML,
                'description': desc
            });
        });
    });
});

router.post('/uploadImage', function (req, res) {
    if (!req.files)
        return res.status(400).send('No files were uploaded.');

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    var uploadedFile = req.files.filesToUpload;
    if (!uploadedFile)
        return res.status(400).send('No files were uploaded.');

    if (!fs.existsSync('public/uploaded')){
        fs.mkdirSync('public/uploaded');
    }

    // Use the mv() method to place the file somewhere on your server
    var fileName = '/uploaded/' + Date.now() + '_' + uploadedFile.name;
    uploadedFile.mv('public' + fileName, function(err) {
        if (err)
            return res.status(500).send(err);

        addImageUrlToDB(encodeURIComponent(fileName), function () {
            res.redirect('/');
        });
    });
});

router.put('/imageUrl/:img', function(req, res, next) {
    addImageUrlAndSendImageHTML(encodeURIComponent(req.params.img), res);
});

router.delete('/imageUrl/:img', function (req, res) {
    var img = req.params.img;
    if (img.indexOf('/uploaded/') == 0) {
        fs.unlink('public' + img);
    }
    deleteImageUrlFromDB(encodeURIComponent(img), function (imageUrls) {
        generateImagesHTML(imageUrls, function (imagesHTML) {
            res.send(imagesHTML);
        })
    });
});

router.post('/description', function (req, res) {
    var desc = req.body.data;
    db.put('description', desc);
    res.send('OK');
});

function addImageUrlToDB(url, callback) {
    var imageUrls = [];
    db.get('image_urls', function (err, value) {
        if (!(err && err.notFound)) {
            var urls = value.split(',');
            for (var i in urls) {
                if (urls[i] != '') {
                    imageUrls.push(urls[i]);
                }
            }
        }
        if (url) {
            imageUrls.push(url);
            db.put('image_urls', imageUrls);
        }
        if (callback) {
            callback(imageUrls);
        }
    });
}

function deleteImageUrlFromDB(url, callback) {
    var imageUrls = [];
    db.get('image_urls', function (err, value) {
        if (!(err && err.notFound)) {
            var urls = value.split(',');
            for (var i in urls) {
                if (url != urls[i]) {
                    if (urls[i] != '') {
                        imageUrls.push(urls[i]);
                    }
                }
            }
        }
        db.put('image_urls', imageUrls);
        if (callback) {
            callback(imageUrls);
        }
    });
}

function addImageUrlAndSendImageHTML(url, res) {
    addImageUrlToDB(url, function (imageUrls) {
        generateImagesHTML(imageUrls, function (imagesHTML) {
            res.send(imagesHTML);
        })
    });
}

function generateImagesHTML(imageUrls, callback) {
    var imagesHTML = '';
    if (!imageUrls) {
        var dbImageUrls = [];
        db.get('image_urls', function (err, value) {
            if (!(err && err.notFound)) {
                var urls = value.split(',');
                for (var i in urls) {
                    if (urls[i] != '') {
                        dbImageUrls.push(urls[i]);
                    }
                }
            }
            generateImagesHTML(dbImageUrls, callback);
        });
        return;
    }

    for (var i in imageUrls) {
        imagesHTML += sprintf('<div class="previewFrame"><img class="previewInList" src="%s"></div>', decodeURIComponent(imageUrls[i]));
    }
    callback(imagesHTML);
}

module.exports = router;
