const net = require('net');
const EventEmitter = require('events').EventEmitter;

class Client extends EventEmitter{

	connect(callback) {
		this.sock = new net.Socket()
		this.sock.connect(9092, '192.168.33.33', callback);
	}

	send(buff) {
		this.sock.write(buff, () => this.read());		
	}

	read(callback) {
		const WAITING_RESPONSE_SIZE = 0;
		const WAITING_PACKET = 1;
		let state = WAITING_RESPONSE_SIZE;
		let responseSize = 0;
		let response = null;

		this.sock.on('readable', () => {
			// Wait for full response :p Thx TSY
		 	while (response === null) { 		
			 	switch(state) {
					case WAITING_RESPONSE_SIZE:
						const size = this.sock.read(4);
						if(size === null) return;
						responseSize = size.readInt32BE(0);
						state = WAITING_PACKET;
						break;
					case WAITING_PACKET:
						response = this.sock.read(responseSize);
						
						if(response === null) return;
						this.emit('response', response);
						break;
				}
		 	}
		});

	}

	close() {
		this.sock.destroy();
	}

}

module.exports = Client;