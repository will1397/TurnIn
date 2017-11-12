var express = require('express');
var app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res) {
	res.sendFile('/public/MainPage.html', {root: __dirname})
});
app.post('/SignUp.html', function(req, res) {
	res.send('Username: ' + req.body.user_name);
});
var port = 8080; // you can use any port
app.listen(port);
console.log('Listening on: ' + port);