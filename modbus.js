var net = require('net');

function ModbusHeader() {
  if (!(this instanceof ModbusHeader)) {
    return new ModbusHeader();
  }
}

ModbusHeader.prototype.parse = function parse(data) {
	
	this.transactionIdentifier = data.readInt16BE(0);
	this.protocolIdentifier =  data.readInt16BE(2);
	this.length =  data.readInt16BE(4);
	this.unitIdentifier = data.readInt8(6);
	this.functionCode = data.readInt8(7);
	
};

ModbusHeader.prototype.setSize = function setSize(size) {
		
	this.size = size;
};

ModbusHeader.prototype.toBuffer = function toBuffer() {
		
	var rsp = new Buffer(8);
	
	rsp.writeInt16BE(this.transactionIdentifier,0);
	rsp.writeInt16BE(this.protocolIdentifier,2);
	rsp.writeInt16BE(2 + this.size,4);
	
	rsp.writeInt8(this.unitIdentifier,6);
	rsp.writeInt8(this.functionCode,7);
	
	return rsp;
};


var server = net.createServer(function(socket) { //'connection' listener
	
	console.log('server connected');
	
	socket.on('end', function() {
		console.log('server disconnected');
	});
	
    socket.on('data', function(data) {
		console.log(data);	
		var header = new ModbusHeader();
		header.parse(data);
		
		switch(header.functionCode)
		{

		case 3:
		
			console.log("recieved FC3");
			var readOffset = data.readInt16BE(8);
			var readCount = data.readInt16BE(10);
			
			
			// construct response payload
			var rsp = new Buffer(readCount*2+1);
			rsp.writeInt8(readCount*2,0); // 2*wordcount as data payload size
			
			for (var i = 0; i < readCount; i++)
			{
				rsp.writeInt16BE(header.transactionIdentifier+i,1+(i*2));
			}
			
			// send response
			header.setSize(rsp.length);	
			socket.write(header.toBuffer());
			socket.write(rsp);
			
			console.log(header);
			console.log(rsp);
			break;
		
		// raise illegal function exception
		default:
			console.log("default");
			var rsp = new Buffer(9);
			
			// mbtcp header
			rsp.writeInt16BE(header.transactionIdentifier,0);
			rsp.writeInt16BE(header.protocolIdentifier,2);
			rsp.writeInt16BE(3,4); // 3 bytes payload
			
			rsp.writeInt8(header.unitIdentifier,6);
			rsp[7] = 0x80 | header.functionCode; // exception rsp function code
			rsp[8] = 0x01; // exception code
			
			console.log(rsp);
			socket.write(rsp);
			
		}
		console.log(header);
		
    });
});

server.listen(502, function() { //'listening' listener
  console.log('server bound');
});