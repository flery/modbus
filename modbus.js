var net = require('net');

var connection = net.createConnection(502);

connection.on('connect', function() {
	console.log('connected');
	connection.write('Hello');
});

connection.on('close', function() {
	console.log('closed');
	connection.end();
});