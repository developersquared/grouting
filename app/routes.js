// app/routes.js
var mysql = require('mysql');


var pool = mysql.createPool({
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
        pool.query('SELECT * FROM tb_grout_data ORDER BY rcv_time DESC LIMIT 1; SELECT rcv_time, vacuum_meter FROM tb_grout_data ORDER BY rcv_time ASC LIMIT 10', function(err, result) {
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

	app.get('/test', function(req, res) {
		var data;
        pool.query('SELECT rcv_time, vacuum_meter FROM tb_grout_data ORDER BY rcv_time ASC LIMIT 10; SELECT rcv_time, vacuum_meter FROM tb_grout_data ORDER BY rcv_time ASC LIMIT 10', function(err, result) {
            if(err) {
                throw err;
            } else {
            	data = result;
                res.json(result);
            }
        });
	});

	app.get('/dbtest', function(req, res) {
		pool.query('SELECT * FROM tb_grout_data ORDER BY rcv_time DESC LIMIT 1; SELECT rcv_time, vacuum_meter FROM tb_grout_data ORDER BY rcv_time ASC LIMIT 10', function(err, result) {
			if(err) {
				throw err;
			} else {
				//obj = {print: result};

				res.json(result[1]);
			}

		});
	});
	// app.get('/monitor/:graph', isLoggedIn, function(req, res) {
	// 	var graphSelection = req.params.graph;
	// 	res.render('graph.ejs', {
	// 		graph: graphSelection
	// 	});
	// });

	app.get('/monitor/vacuum-pump', isLoggedIn, function(req, res) {
	    res.render('graph.ejs');
    });

    app.get('/monitor/grouting-pump', isLoggedIn, function(req, res) {
        res.render('graph.ejs');
    });

    app.get('/monitor/airvent-01', isLoggedIn, function(req, res) {
        res.render('graph.ejs');
    });

    app.get('/monitor/airvent-02', isLoggedIn, function(req, res) {
        res.render('graph.ejs');
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
