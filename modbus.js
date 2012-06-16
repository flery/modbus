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
		
		console.log(data.length);
		var telegram = {};
		telegram.transactionIdentifier = data.readInt16BE(0);
		telegram.protocolIdentifier =  data.readInt16BE(2);
		telegram.length =  data.readInt16BE(4);
		telegram.unitIdentifier = data.readInt8(6);
		telegram.functionCode = data.readInt8(7);
		
		switch(telegram.functionCode)
		{

		case 3:
			console.log("recieved FC3");
			telegram.offset = data.readInt16BE(8);
			telegram.size = data.readInt16BE(10);
			
			var rsp = new Buffer(telegram.size*2+9); // payload + header
			
			// mbtcp header
			rsp.writeInt16BE(telegram.transactionIdentifier,0);
			rsp.writeInt16BE(telegram.protocolIdentifier,2);
			rsp.writeInt16BE(telegram.size*2+3,4);
			
			rsp.writeInt8(telegram.unitIdentifier,6);
			rsp.writeInt8(telegram.functionCode,7);	
			rsp.writeInt8(telegram.size*2,8); // 2*wordcount as data payload size
			
			for (var i = 0; i < telegram.size; i++)
			{
				rsp.writeInt16BE(i,9+(i*2));
			}
			console.log(rsp);
			socket.write(rsp);
			break;
		
		// raise illegal function exception
		default:
			console.log("default");
			var rsp = new Buffer(9);
			
			// mbtcp header
			rsp.writeInt16BE(telegram.transactionIdentifier,0);
			rsp.writeInt16BE(telegram.protocolIdentifier,2);
			rsp.writeInt16BE(3,4); // 3 bytes payload
			
			rsp.writeInt8(telegram.unitIdentifier,6);
			rsp[7] = 0x80 | telegram.functionCode; // exception rsp function code
			rsp[8] = 0x01; // exception code
			
			console.log(rsp);
			socket.write(rsp);
			
		}
		console.log(telegram);
		
    });
});

server.listen(502, function() { //'listening' listener
  console.log('server bound');
});