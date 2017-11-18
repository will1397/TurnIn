//Express
var express = require('express');
var app = express();

//Node server/io packages
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//Add authentication session
var session = require('client-sessions');
app.use(session({
	cookieName: 'session',
	secret: 'foritsalwaysfairweather',
	duration: 30 * 60 * 1000,
	activeDuration: 5 * 60 * 1000,
	secure: true
}));

var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var server = require('http').Server(app);
var io = require('socket.io')(server);

//User authentication persistence package
var passport = require('passport');

//MySQL database package
var mysql = require('mysql');

//Password Encryption packages
var bcrypt = require('bcrypt');
const saltRounds = 10;

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "lexijr929",
	database: "TurnIn"
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

function checkLoggedIn (req, res, next) { //TODO - add to get commands
	if (!req.user) {
		res.redirect('Login');
	}
	else {
		next();
	}
}

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/uploads'));

app.get('/', function(req, res) {
	res.render('MainPage');
});

app.get('/SignUp.ejs', function(req, res) {
	res.render('SignUp', {msg: ''});
});

app.get('/Login.ejs', function(req, res) {
	res.render('Login', {msg: ''});
});

app.get('/FileInput.ejs', function(req, res) {
    res.render('FileInput');
});

app.get('/ManageFileboxes.ejs', function(req, res) {
    res.render('ManageFileboxes');
});

io.on('connection', function(socket) {
	console.log('a user connected');
	socket.on('disconnect', function() {
		console.log('a user disconnected');
	});
});

app.post('/signup', function(req, res) {
	if (req.body.user_name && req.body.user_password) {
		var name = req.body.full_name;
        var uname = req.body.user_name;
        var pw = req.body.user_password;

		//check if username and password can be used with call to MySQL DB
		var sql = 'SELECT * FROM Users WHERE username = ?';
		con.query(sql, [uname], function(err, result) {
			if (err) throw err;

			if (result.length <= 0) { //username not found, add new person to Users table
				//Use bcrypt to hash password
				bcrypt.hash(pw, saltRounds, function(err, hash) {

                    //Save hash into DB
                    sql = "INSERT INTO Users (name, username, password) VALUES ('" + name + "', '" + uname + "', '" + hash + "')";
                    con.query(sql, function(err, result) {
                        if (err) throw err;
                        //Save user session
                        req.session.user = uname;
                        res.render('SignUp', {msg: 'Success!'});
                    });
				});
            }

			else {
				res.render('SignUp', {msg: 'Username is already in use!'});
			}
		});
	}
});

app.post('/login', function(req, res) {
	var uname = req.body.user_name;
	var pw = req.body.user_password;

	var sql = 'SELECT * FROM Users WHERE username = ?';
	con.query(sql, [uname], function(err, result) {
		if (err) throw err;

		if (result.length <= 0) {
			res.render('Login', {msg: 'Login Failed! Username not found'})
		}

		else {
            bcrypt.compare(pw, result[0].password, function (err, re) {
                if (re === true) {
                    //Save user session
                    req.session.user = uname;
                    res.render('Login', {msg: 'Success!'});
                }
                else {
                    res.render('Login', {msg: 'Login Failed! Incorrect Password'});
					console.log(pw);
                    console.log(result[0].password);
                }
            });
        }
	});
});

app.post('/upload', function(req, res) {
	var form = new formidable.IncomingForm();
	form.multiples = true;

	form.uploadDir = (__dirname + '/uploads');
	form.on('file', function(field, file) {
        fs.renameSync(file.path, path.join(form.uploadDir, file.name));
	});

	form.on('error', function(err) {
		console.log(err);
	});

	form.on('end', function() {
		res.end('success');
	});

	form.parse(req);
    app.use(express.static(__dirname + '/uploads'));
});

app.get('/FileInput.ejs', function(req, res) {
	res.render('FileInput');
});

app.get('/Logout', function(req, res) {
	req.session.reset();
	res.redirect('/');
});

var port = 8080; // you can use any port
app.listen(port);
console.log('Listening on: ' + port);