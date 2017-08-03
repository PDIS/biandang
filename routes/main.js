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
        var order = req.body.order;
        orders[userName] = {order: order, paid: false};
        db.put('orders', JSON.stringify(orders));
        if (req.body.getPriceList) {
            settlePrices(orders, function (orderCollection, amount, total) {
                res.render('priceList', {orderCollection: orderCollection, amount: amount, total: total});
            });
        } else {
            res.render('done', {lastOrder: order});
        }
    });
});

router.delete('/pay/:userName', function (req, res) {
    var userName = decodeURIComponent(req.params.userName);
    db.get('orders', function (err, value) {
        var orders = {};
        if (!(err && err.notFound)) {
            orders = JSON.parse(value);
        }
        if (typeof orders[userName] === 'string') {
            orders[userName] = {order: orders[userName], paid: false};
        } else {
            orders[userName].paid = false;
        }
        db.put('orders', JSON.stringify(orders));
        res.send('ok');
    });
});

router.put('/pay/:userName', function (req, res) {
    var userName = decodeURIComponent(req.params.userName);
    db.get('orders', function (err, value) {
        var orders = {};
        if (!(err && err.notFound)) {
            orders = JSON.parse(value);
        }
        if (typeof orders[userName] === 'string') {
            orders[userName] = {order: orders[userName], paid: true};
        } else {
            orders[userName].paid = true;
        }
        db.put('orders', JSON.stringify(orders));
        res.send('ok');
    });
});

router.delete('/order/:userName', function (req, res) {
    var userName = decodeURIComponent(req.params.userName);
    if (!userName) {
        return;
    }
    db.get('orders', function (err, value) {
        var orders = {};
        if (!(err && err.notFound)) {
            orders = JSON.parse(value);
        }
        delete orders[userName];
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
            // Older version
            if (typeof orders[name] === 'string') {
                res.send(orders[name]);
            } else {
                res.send(orders[name].order);
            }
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
    var before = req.body.before;
    var after = req.body.after;
    db.get('prices', function (err1, value1) {
        var priceList = [];
        if (!(err1 && err1.notFound)) {
            priceList = JSON.parse(value1);
        }
        // Alter price in list
        var found = false;
        for (var i = 0; i < priceList.length; i++) {
            var o = priceList[i];
            if (o.name === before) {
                if (after) {
                    o.name = after;
                } else {
                    priceList.splice(i, 1);
                }
                found = true;
                break;
            }
        }
        if (!found && after != '') {
            priceList.push({name: after, price: ''});
        }
        db.put('prices', JSON.stringify(priceList), function () {
            generatePriceList(req, res);
        });
    });

});

router.post('/setPrice', function (req, res) {
    var menu = req.body.menu;
    var price = req.body.price;
    if (menu === '' || price === '') {
        generatePriceList(req, res);
        return;
    }
    db.get('prices', function (err1, value1) {
        var orderCollection = [];
        if (!(err1 && err1.notFound)) {
            orderCollection = JSON.parse(value1);
        }
        var found = false;
        for (var k in orderCollection) {
            if (orderCollection[k].name == menu) {
                orderCollection[k].price = price;
                found = true;
                break;
            }
        }
        if (!found) {
            orderCollection.push({
                name: menu,
                price: price
            });
        }
        db.put('prices', JSON.stringify(orderCollection));
        generatePriceList(req, res);
    });
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
            if (typeof orders[name] === 'string') {
                myOrder = res.__('last_order') + orders[name];
            } else {
                myOrder = res.__('last_order') + orders[name].order;
            }
        }
        settlePrices(orders, function (orderCollection, total) {
            res.render('admin', {
                'imagesHTML': imagesHTML,
                'description': desc,
                'orders': orders,
                'orderCollection': orderCollection,
                'total': total,
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
            if (typeof orders[name] === 'string') {
                myOrder = res.__('last_order') + orders[name];
            } else {
                myOrder = res.__('last_order') + orders[name].order;
            }
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
        var priceList = [];
        if (!(err1 && err1.notFound)) {
            priceList = JSON.parse(value1);
        }
        var orderCollection = [];
        for (var i in priceList) {
            var p = priceList[i];
            orderCollection.push({
                name: p.name,
                quantity: 0,
                price: p.price
            });
        }
        var amount = 0;
        var total = 0;
        for (var key in orders) {
            var order = orders[key];
            if (!(typeof order === 'string')) {
                order = order.order;
            }
            if (order === '') continue;
            var found = false;
            for (var k in orderCollection) {
                var menu = orderCollection[k];
                if (menu.name.length == 0) {
                    continue;
                }
                if (order.indexOf(menu.name) >= 0) {
                    menu.quantity++;
                    found = true;
                    break;
                }
            }
            if (!found) {
                orderCollection.push({
                    name: order,
                    quantity: 1,
                    price: ''
                });
            }
        }
        for (var ti in orderCollection) {
            var o = orderCollection[ti];
            if (o.price !== '') {
                total += o.quantity * o.price;
            }
            amount++;
        }
        orderCollection.sort(function (a, b) {
            if (b.quantity != a.quantity) {
                return b.quantity - a.quantity;
            } else {
                return a.name.localeCompare(b.name);
            }
        });
        if (callback) {
            callback(orderCollection, total);
        }
    });
}

function getUserName(req) {
    return decodeURIComponent(req.headers['x-sandstorm-username']);
}

function isAdmin(req) {
    var permissions = req.headers['x-sandstorm-permissions'];
    if (!permissions) return false;
    return permissions.indexOf('modify') >= 0;
}

function generatePriceList(req, res) {
    db.get('orders', function (err, value) {
        var orders = {};
        if (!(err && err.notFound)) {
            orders = JSON.parse(value);
        }
        settlePrices(orders, function (orderCollection, amount, total) {
            res.render('priceList', {orderCollection: orderCollection, amount: amount, total: total});
        });
    });
}

module.exports = router;
