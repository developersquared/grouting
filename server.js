// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var session  = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var path = require('path');
var mysql = require('mysql');

var app      = express();
var port     = process.env.PORT || 8080;

var passport = require('passport');
var flash    = require('connect-flash');
var io = require('socket.io-client');

// configuration ===============================================================

require('./config/passport')(passport); // pass passport for configuration

var socket = io.connect('http://localhost:9001', {
    reconnect: false
});

socket.on('data_in', function (data) {
    console.log("socket data_in:"+data);
});

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '/public')));

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
	secret: 'vidyapathaisalwaysrunning',
	resave: true,
	saveUninitialized: true
 } )); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(function(req, res, next) {
	res.locals.user = req.user;
	next();
});
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport


// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);

