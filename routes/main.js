var express = require('express');
var router = express.Router();
var sprintf = require("sprintf-js").sprintf;
var levelup = require('levelup');
var fs = require('fs');

var db = levelup('/var/biandang_db');

router.get('/', function (req, res) {
    db.get('description', function (err, value) {
        var desc = '';
        if (!(err && err.notFound)) {
            desc = value;
        }
        generateImagesHTML(null, function (imagesHTML) {
            if (isAdmin(req)) {
                renderAdmin(req, res, imagesHTML, desc);
            } else {
                renderEnquete(req, res, imagesHTML, desc);
            }
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

    if (!fs.existsSync('/var/biandangImages')) {
        fs.mkdirSync('/var/biandangImages');
    }

    // Use the mv() method to place the file somewhere on your server
    var fileName = '/biandangImages/' + Date.now() + '_' + uploadedFile.name;
    uploadedFile.mv('/var' + fileName, function (err) {
        if (err)
            return res.status(500).send(err);

        addImageUrlToDB(encodeURIComponent(fileName), function () {
            res.redirect('/');
        });
    });
});

router.put('/imageUrl/:img', function (req, res, next) {
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

router.post('/order', function (req, res) {
    var userName = req.body.myName;
    if (!userName) {
        userName = getUserName(req);
    }
    db.get('orders', function (err, value) {
        var orders = {};
        if (!(err && err.notFound)) {
            orders = JSON.parse(value);
        }
        orders[userName] = req.body.order;
        db.put('orders', JSON.stringify(orders));
        res.redirect('/');
    });
});

router.get('/getMyOrder', function (req, res) {
    db.get('orders', function (err, value) {
        var orders = {};
        if (!(err && err.notFound)) {
            orders = JSON.parse(value);
        }
        var name = req.query.name;
        if (orders[name]) {
            res.send(orders[name]);
        } else {
            res.send('');
        }
    });
});

router.post('/clearOrders', function (req, res) {
    if (!isAdmin(req)) {
        return;
    }
    db.del('orders');
    res.send('ok');
});

router.post('/setMenu', function (req, res) {
    // TODO
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

function renderAdmin(req, res, imagesHTML, desc) {
    db.get('orders', function (err, value) {
        var orders = {};
        if (!(err && err.notFound)) {
            orders = JSON.parse(value);
        }
        var name = getUserName(req);
        var myOrder = res.__('order');
        if (name in orders) {
            myOrder = res.__('last_order') + orders[name];
        }
        settlePrices(orders, function (orderColletion) {
            res.render('admin', {
                'imagesHTML': imagesHTML,
                'description': desc,
                'orders': orders,
                'orderColletion': orderColletion,
                'myName': name,
                'myOrder': myOrder
            });
        });
    });
}

function renderEnquete(req, res, imagesHTML, desc) {
    db.get('orders', function (err, value) {
        var orders = {};
        if (!(err && err.notFound)) {
            orders = JSON.parse(value);
        }
        var name = getUserName(req);
        if (name == 'Anonymous User') {
            name = '';
        }
        var myOrder = res.__('order');
        if (name in orders) {
            myOrder = res.__('last_order') + orders[name];
        }
        res.render('enquete', {
            'imagesHTML': imagesHTML,
            'description': desc,
            'myName': name,
            'myOrder': myOrder
        });
    });
}

function settlePrices(orders, callback) {
    db.get('prices', function (err1, value1) {
        var orderColletion = [];
        if (!(err1 && err1.notFound)) {
            orderColletion = JSON.parse(value1);
        }
        // Check unpriced items
        var unpriced = [];
        for (var key in orders) {
            var order = orders[key];
            var found = false;
            for (var menu in orderColletion) {
                if (order.indexOf(menu.name) >= 0) {
                    menu.quantity++;
                    found = true;
                    break;
                }
            }
            if (!found) {
                orderColletion.push({
                    name: order,
                    quantity: 1,
                    price: ''
                });
            }
        }
        if (callback) {
            callback(orderColletion);
        }
    });
}

function getPrice(order, orderColletion) {

    return null;
}

function getUserName(req) {
    return decodeURIComponent(req.headers['x-sandstorm-username']);
}

function isAdmin(req) {
    var permissions = req.headers['x-sandstorm-permissions'];
    if (!permissions) return false;
    return permissions.indexOf('modify') >= 0;
}

module.exports = router;
