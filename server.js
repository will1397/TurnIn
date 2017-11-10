var express = require('express');
var app = express();
app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res) {
	res.sendFile('/public/MainPage.html', {root: __dirname})
});
var port = 8080; // you can use any port
app.listen(port);
console.log('Listening on: ' + port);