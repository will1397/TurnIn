var express = require('express');
var app = express();
const bodyParser = require('body-parser');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var passport = require('passport');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
	res.sendFile('/public/MainPage.html', {root: __dirname})
});

io.on('connection', function(socket) {
	console.log('a user connected');
	socket.on('disconnect', function() {
		console.log('a user disconnected');
	});
});

app.post('/SignUp.html', function(req, res) {
	res.send('Username: ' + req.params.user_name); //test
	
	if (req.body.user_name && req.body.user_password) {
		//check if username and password can be used with call to MySQL DB
	}
});

var port = 8080; // you can use any port
app.listen(port);
console.log('Listening on: ' + port);