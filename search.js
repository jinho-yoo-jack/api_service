var express = require('express');
var app = express();

var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var schedule = require('node-schedule'); // 스케줄 처리를 위함

var approot = require('app-root-path');
var config = require('./config/config');


/************************************************************
 * 크로스 도메인 처리
 ************************************************************/
var corsOptions = {
    origin: true,
    credentials: true
};

var CORS = require('cors')(corsOptions);

app.use(CORS);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use(require('./service/util/get_user_key'));

// cookie parser
var cookie_parser = require('cookie-parser');
app.use(cookie_parser());


/***********************************************************************
 * v1 Search
 **********************************************************************/
// Search
//var app_main = require('./routes/search');
//app.use('/search', app_main);

var app_main = require('./routes/search');
app.use('/search', app_main);

/***********************************************************************
 * 에러처리
 **********************************************************************/
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


// 8080 으로 변경예정
var port = '14050';
// var port = normalizePort(process.env.PORT || config.app_server_default_port);

app.set('port', port);


/***********************************************************************
 * 서버기동
 **********************************************************************/
var server = http.createServer(app);
server.listen(port);
server.on('listening', onListening);

console.log("process.pid:"+process.pid);



function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) { return val; }
  if (port >= 0) { return port; }

  return false;
}

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}

/************************************************************
 * 에러 처리...
 ************************************************************/
process.on('uncaughtException', function (err) {
  //예상치 못한 예외 처리
  console.error('uncaughtException 발생 : ' + err);
});

