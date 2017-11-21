//Express
var express = require('express');
var app = express();
var nconf = require('nconf');
var moment = require('moment');

nconf.file({
  file: './config/config.json'
  });
  if(!Object.keys(nconf.get()).length) {
    throw new Error('Unable to load config file. Check to make sure config/config.json exists');
  }

//Node server/io packages
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false})); //sometimes it's true, sometimes it's false; who knows


//Add authentication session
var sessions = require('client-sessions');
app.use(sessions({
	cookieName: 'session',
	secret: 'for1010itsalways1001fairweather0101',
	duration: 30 * 60 * 1000,
	cookie: {
        ephemeral: true //ends the cookie when the browser closes (not the window/tab but the browser itself)
    }
}));

app.use(sessions({
	cookieName: 'fileboxcode',
	secret: 'once3492upon02543a043235234time32412',
	duration: 30 * 60 * 1000,
	cookie: {
		ephemeral: true
	}
}));

app.use(function (req, res, next) {
  if(req.session.user){
    res.locals.login = true;
    res.locals.user = req.session.user;
  }
  else{
    res.locals.login = false;
  }
  console.log(res.locals.login);
  next();
});



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
var con = mysql.createConnection(nconf.get('mysql'));

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

function checkLoggedIn (req, res, next) {
	if (!req.session.user) {
		req.session.reset();
		res.redirect('/Login.ejs');
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

app.get('/ManageFileboxes.ejs', checkLoggedIn, function(req, res) {
	var sql = 'SELECT * FROM Filebox WHERE username = ?';
	con.query(sql, [req.session.user], function(err, result) {
		res.render('ManageFileboxes', {box: result}); //will return either empty array or array with values
	});
});

app.get('/Settings.ejs', function(req,res) {
  res.render('Settings', {msg: ''});
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
                        res.locals.login = true;
                        res.locals.user = req.session.user;
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
                    res.locals.login = true;
                    res.locals.user = req.session.user;

                    res.render('Login',{msg: 'Success'});
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
	var name;

	form.uploadDir = (__dirname + '/uploads');
	form.on('file', function(field, file) {
		name = file.name;
        fs.renameSync(file.path, path.join(form.uploadDir, file.name));
	});

	form.on('error', function(err) {
		console.log(err);
	});

	form.on('end', function() {
        app.use(express.static(__dirname + '/uploads'));

        //Add file to filebox in database
		var sql = 'SELECT * FROM Filebox WHERE code = ?';
		con.query(sql, [req.fileboxcode.code], function(err, result) {
			if (err) throw err;

			sql = "INSERT INTO Files (boxname, filename, username) VALUES ('" + result[0].boxname + "', '" + name + "', '" + result[0].username + "');";
			console.log(sql);
			con.query(sql, function(err, re) {
				if (err) throw err;
				res.end('success');
			});
		});
	});

	form.parse(req);
});

app.post('/getFiles', function(req, res) {
	var filebox = req.body.name;

    var sql = "SELECT * FROM Filebox WHERE username = '" +  req.session.user + "' AND boxname = '" + filebox + "';";
    con.query(sql, [req.session.user], function(err, re) {

        var sql = "SELECT * FROM Files WHERE username = '" + req.session.user + "' AND boxname = '" + filebox + "';";

        con.query(sql, function (err, result) {
            if (err) throw err;

            var array = new Array();
            array.push(re[0].code);
            array.push(result);

            res.send(array);
        });
    });
});

app.post('/fileboxSearch', function(req, res) {
	var sql = 'SELECT * FROM Filebox WHERE code = ?';
	con.query(sql, [req.body.boxcode], function(err, result) {
		if (err) throw err;

		if (result.length === 0) {
			res.redirect('/');
		}
		else {
			req.fileboxcode.code = req.body.boxcode;
			res.render('FileInput');
		}
	})
});

app.post('/addBox', function(req, res) {
	var creationTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
	var uname = req.session.user;
	var boxname = req.body.newboxname;
	var code = Math.floor(Math.random() * 90000000)  + 10000000; //generate random code for box

	var sql = "SELECT * FROM Filebox WHERE username = '" + uname + "' AND boxname = '" + boxname + "';";
	con.query(sql, function(err, re) {

		if (re.length === 0) {
            sql = "INSERT INTO Filebox (username, boxname, code, time) VALUES ('" +
                uname + "', '" + boxname + "', '" + code + "', '" + creationTime + "');";

            con.query(sql, function (err, result) {
                if (err) throw err;

                var message = "Filebox Successfully Created, Filebox Code: " + code;
                res.render('Settings', {msg: message});
            });
        }

        else {
			res.render('Settings', {msg: 'Filebox Already Created'});
		}
    });
});

app.post('/removeBox', function(req, res) {
	var boxname = req.body.oldboxname;
	var uname = req.session.user;

	var sql = "DELETE FROM Filebox WHERE username = '" + uname + "' AND boxname = '" + boxname + "';";
	con.query(sql, function(err, re) {
		if (err) throw err;

		res.render('Settings', {msg: "Box Removed If Already Created"});
	})
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
