const net = require('net');
const EventEmitter = require('events').EventEmitter;


const PacketStreamWrapper = require('./PacketStreamWrapper');


//@TODO to remove
const cst = require('../protocol/constants');
const Response = require('../protocol/Response');
const Request = require('../protocol/Request');


class Client extends EventEmitter {
    
    constructor() {
        super();
        this.sock = null;
        this.ps = null;
    }

    connect(options, callback) {        
        if(callback) this.once('connect', callback);

        this.sock = net.createConnection(options, () => {
            this.ps = new PacketStreamWrapper(this.sock);
            this.ps.on('packet', (buf) => this.onpacket(buf));
            this.emit('connect');
        });
    }

    onpacket(buf) {
        // parse
        this.emit('response', buf.toString('hex'));
    }

    close() {
        this.sock.destroy();
    }

}

module.exports = Client;