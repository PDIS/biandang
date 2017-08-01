var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var i18n = require('i18n');
var fileUpload = require('express-fileupload');

var main = require('./routes/main');

var app = express();

// i18n setup
i18n.configure({
    locales: ['zh-TW', 'en'],
    defaultLocale: 'zh-TW',
    directory: __dirname + "/locales",
    // オブジェクトを利用したい場合はtrue
    objectNotation: true
});

app.use(i18n.init);
app.use(fileUpload());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/biandangImages', express.static('/var/biandangImages'))

app.use(main);
// app.use('/', main);
// app.use('/uploadImage', main);
// app.use('/imageUrl', main);
// app.use('/description', main);
// app.use('/order', main);
// app.use('/getMyOrder', main);
// app.use('/clearOrders', main);
// app.use('/setMenu', main);
// app.use('/pay', main);
// app.use('/done', main);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
