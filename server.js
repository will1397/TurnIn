var express = require('express');
var app = express();
const bodyParser = require('body-parser');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var passport = require('passport');
var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "lexijr929"
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    con.query("USE TurnIn;", function(err, result) {
    	if (err) throw err;
    	console.log("Using TurnIn database");
	});
});

/**
var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');

// Connection URL
var url = 'mongodb://localhost:27017/TurnIn';

// Use connect method to connect to the server
MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    db.close();
});
 **/

/**
//Import the mongoose module
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	name: String,
	username: String,
	password: String
});

var FileboxSchema = new Schema({
	username: String,
	boxname: String,
	timeCreated: { type: Date, default: Date.now},
	timeActive: {type: Date}
});

var FileSchema = new Schema({
	boxname: String,

})

var userModel = mongoose.model('userModel', userSchema);

//Set up default mongoose connection
var mongoDB = 'mongodb://127.0.0.1/TurnIn';
mongoose.connect(mongoDB, {
    useMongoClient: true
});

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
**/

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