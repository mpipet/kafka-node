const net = require('net');
const EventEmitter = require('events').EventEmitter;

const Request = require('./protocol/Request');
const Response = require('./protocol/Response');
const PacketStreamWrapper = require('./PacketStreamWrapper');

class Client extends EventEmitter {
    
  constructor() {
    super();
    this.sock = null;
    this.ps = null;
    this.waiting = {};
  }

  connect(options, callback) {        
    if(callback) this.once('connect', callback);

    this.sock = net.createConnection(options, () => {
      this.ps = new PacketStreamWrapper(this.sock);
      this.ps.on('packet', (buff) => this.onpacket(buff));
      this.emit('connect');
    });
  }

  onpacket(buff) {
    const correlationId  = buff.readInt32BE(0);
    if (!correlationId in this.waiting) {
      throw new Error('correlation_id do not correspond to any previous requests');
    }

    const infos =  this.waiting[correlationId];

    const response = new Response(buff, infos.apiKey, infos.apiVersion);
    const data = response.read();

    delete this.waiting[correlationId];
    this.emit('response', data);
  }

  send(apiKey, apiVersion, payload) {
    const correlationId = Math.floor(Math.random() * 2147483647);
    this.waiting[correlationId] = {
      apiKey: apiKey,
      apiVersion: apiVersion
    };

    const buffer = Request.createBuffer(apiKey, apiVersion, correlationId, payload);
    this.ps.send(buffer);
  }

  close() {
    this.sock.destroy();
  }

}

module.exports = Client;