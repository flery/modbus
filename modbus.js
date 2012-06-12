var net = require('net');

var Request = {};
var Response = {};

var ReadMultipleRegisters = {};
ReadMultipleRegisters.parse = function(buffer) {
};

var server = net.createServer(function(socket) { //'connection' listener
  console.log('server connected');
  socket.on('end', function() {
    console.log('server disconnected');
  });
  
    socket.on('data', function(data) {
		console.log(data);
        socket.write(data);
		
		console.log(data.length);
		var telegram = {};
		telegram.transactionIdentifier = data.readInt16BE(0);
		telegram.protocolIdentifier =  data.readInt16BE(2);
		telegram.length =  data.readInt16BE(4);
		telegram.unitIdentifier = data.readInt8(6);
		telegram.functionCode = data.readInt8(7);
		
		console.log(telegram);
    });
});

server.listen(502, function() { //'listening' listener
  console.log('server bound');
});