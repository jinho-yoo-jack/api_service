const express = require('express');
const app = express();

const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const http = require('http');
const schedule = require('node-schedule'); // 스케줄 처리를 위함

const approot = require('app-root-path');
const config = require(`${approot}` + '/config/config');


/************************************************************
 * 크로스 도메인 처리
 ************************************************************/
const corsOptions = {
    origin: true,
    credentials: true
};

const CORS = require('cors')(corsOptions);

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
const cookie_parser = require('cookie-parser');
app.use(cookie_parser());


/***********************************************************************
 * v1 Search
 **********************************************************************/
// Routing
//const app_main = require('./routes/search');
//app.use('/search', app_main);

//const app_main = require('./routes/search');
let totalsearch = require('./routes/totalsearch');
app.use('/search/totalsearch', totalsearch);

/***********************************************************************
 * 에러처리
 **********************************************************************/
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
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
const port = '14050';
// const port = normalizePort(process.env.PORT || config.app_server_default_port);

app.set('port', port);


/***********************************************************************
 * 서버기동
 **********************************************************************/
const server = http.createServer(app);
server.listen(port);
server.on('listening', onListening);

console.log("process.pid:"+process.pid);



function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) { return val; }
  if (port >= 0) { return port; }

  return false;
}

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}

/************************************************************
 * 에러 처리...
 ************************************************************/
process.on('uncaughtException', function (err) {
  //예상치 못한 예외 처리
  console.error('uncaughtException 발생 : ' + err);
});

