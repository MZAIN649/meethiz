const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const indexRouter = require('./routes/index');
const session = require('express-session');
const app = express(); // an express sever is created
require('dotenv').config();
var debug = require('debug')('myexpressapp:server');
var http = require('http');
var port = normalizePort('3000');
var server = http.createServer(app);

const distDir = "../BackEnd/FrontComp";
app.use(express.static(path.join(__dirname, distDir))); // app will invoke static file server for express
// at distDir it will serve the static files
app.use("/Documents", express.static(path.join("../BackEnd/Documents")));
app.use(logger('dev')); // morgan logger to display server actions in console
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(session({
  secret: 'ssshhhhh',
  saveUninitialized: true,
  resave: true
}));
app.set('view engine', 'pug');

// any call without api will be directed to index.html
app.use(/^((?!(api)).)*/, (req, res) => {
  res.sendFile(path.join(__dirname, distDir + '/index.html'));
});

//-----All Routes Start Here
app.use('/', indexRouter);
//app.use('/api/auth', authRouter);

app.set('trust proxy', true);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  next();
});


app.set('port', port);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val) {
  let port = parseInt(val, 10);
  if (isNaN(port)) {
    // named pipe
    return val;
  }
  if (port >= 0) {
    // port number
    return port;
  }
  return false;
}

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }
  let bind = typeof port === 'string' ?
    'Pipe ' + port :
    'Port ' + port;
  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  let addr = server.address();
  let bind = typeof addr === 'string' ?
    'pipe ' + addr :
    'port ' + addr.port;
  debug('Listening on ' + bind);
}



module.exports = app; //Helps to include our app
