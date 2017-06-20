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
            res.render('enquete', {
                'imagesHTML': imagesHTML,
                'description': desc
            });
        });
    });
});


module.exports = router;
