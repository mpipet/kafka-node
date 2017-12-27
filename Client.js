const net = require('net');
const EventEmitter = require('events').EventEmitter;

class Client extends EventEmitter{

	constructor(brokers) {
		super();
		this.socks = [];
		const hosts = brokers.split(',');
		this.brokersConfig = hosts.map((host) => {
			const tmp = host.split(':');
			return {host: tmp[0], port: tmp[1]};
		});
	}

	connect(brokerIndex, callback) {
		const brokerConf = this.brokersConfig[brokerIndex]; 
		this.socks[brokerIndex] = new net.Socket();
		this.socks[brokerIndex].connect(brokerConf.port, brokerConf.host, callback);		
	}

	send_to_broker(buff, callback) {
		const brokerIndex = Math.floor(Math.random() * (this.brokersConfig.length - 0) + 0);

		const brokerConf = this.brokersConfig[brokerIndex]; 
		const sock = new net.Socket();
		console.log(brokerConf.port, brokerConf.host)
		this.on('response', (buff) => {
			sock.destroy();
			callback(buff);
		});

		sock.connect(brokerConf.port, brokerConf.host, () => {
			sock.write(buff, () => this.read(sock));
		});				
	}

	send(brokerIndex, buff) {
		const sock = this.socks[brokerIndex];
		sock.write(buff, () => this.read());	
	}

	read(sock) {
		const WAITING_RESPONSE_SIZE = 0;
		const WAITING_PACKET = 1;
		let state = WAITING_RESPONSE_SIZE;
		let responseSize = 0;
		let response = null;

		sock.on('readable', () => {			
			// Wait for full response :p Thx TSY
		 	while (response === null) { 		
			 	switch(state) {
					case WAITING_RESPONSE_SIZE:
						// console.log('WAITING_RESPONSE_SIZE');
						const size = sock.read(4);
						// console.log('size', size);
						if(size === null) return;
						responseSize = size.readInt32BE(0);
						state = WAITING_PACKET;
						break;
					case WAITING_PACKET:
						// console.log('WAITING_PACKET');
						response = sock.read(responseSize);
						
						if(response === null) return;
						this.emit('response', response);
						break;
				}
		 	}
		});

	}

	close(brokerIndex) {
		this.socks[brokerIndex].destroy();
	}

}

module.exports = Client;