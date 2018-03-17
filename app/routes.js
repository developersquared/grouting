// app/routes.js
var mysql = require('mysql');
var moment = require('moment');


var con = mysql.createConnection({
	host: 'contekdb.cdefrdxudont.ap-northeast-2.rds.amazonaws.com',
	user: 'admin',
	password: 'contekenc!!',
	database: 'dbcontek',
	multipleStatements: true
});

module.exports = function(app, passport) {
	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {
		res.render('index.ejs'); // load the index.ejs file
	});

	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/dashboard', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
		}),
        function(req, res) {
            console.log("hello");

            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// PROFILE SECTION =========================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			user : req.user // get the user out of session and pass to template
		});
	});

	app.get('/dashboard', isLoggedIn, function(req, res) {
        con.query('SELECT * FROM tb_grout_data ORDER BY rcv_time DESC LIMIT 1; SELECT rcv_time, vacuum_meter FROM tb_grout_data ORDER BY rcv_time DESC LIMIT 10; SELECT * FROM tb_grout_status ORDER BY op_time DESC LIMIT 1', function(err, result) {
            if(err) {
                throw err;
            } else {


                res.render('dashboard.ejs', {
                    user : req.user,
					result : result
                });
            }
        });
	});
	app.post('/grout-meter-input/:value', function(req, res) {
        var x = new Date().toISOString().slice(0, 19).replace('T', ' ');
        var sql = "INSERT INTO tb_grout_command (grout_flow_meter, op_time) VALUES ('" + req.params.value + "', '" + x + "')";
        //Connect to the database pool
        con.query(sql, function (err) {
        	if (err) throw err;
        	console.log("grout-meter-input data has been inserted");
        	res.redirect('/dashboard');
		});
        //Insert the value from URL into the database using a query string
        //Redirect to /dashboard
    });
    app.post('/vacuum-meter-input/:value', function(req, res) {
        var x = new Date().toISOString().slice(0, 19).replace('T', ' ');
        var sql = "INSERT INTO tb_grout_command (vacuum_meter, op_time) VALUES ('" + req.params.value + "', '" + x + "')";
        //Connect to the database pool
        con.query(sql, function (err) {
        	if (err) throw err;
        	console.log("vacuum-meter-input data has been inserted");
        	res.redirect('/dashboard');
		});
        //Insert the value from URL into the database using a query string
        //Redirect to /dashboard
    });
	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
};

// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}
