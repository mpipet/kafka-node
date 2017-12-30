const net = require('net');
const EventEmitter = require('events').EventEmitter;

const Request = require('./protocol/Request');
const Response = require('./protocol/Response');
const PacketStreamWrapper = require('./PacketStreamWrapper');

class Client extends EventEmitter {
    
  constructor() {
    super();
    this.socket = null;
    this.ps = null;
    this.correlationId = 0;
  }

  connect(options, callback) {        
    if(callback) this.once('connect', callback);

    this.socket = net.createConnection(options, () => {
      this.ps = new PacketStreamWrapper(this.socket);
      this.ps.on('packet', (buff) => this.onpacket(buff));
      this.emit('connect');
    });

    this.socket.on('error', (err) => this.onerror(err));
    this.socket.once('close', () => this.onclose());
  }

  onpacket(buffer) {
    this.emit('response', buffer);
  }

  onerror(err) {
    this.emit(err);
  }

  onclose() {
    this.socket.removeListener('error', this.onerror);
    this.socket = null;
    if (this.ps) {
        this.ps.removeListener('packet', this.onpacket);
        this.ps = null;
    }
    this.emit('close');
  }

  write(buffer) {
    this.ps.write(buffer);
  }

  send(apiKey, apiVersion, payload, callback) {
    const correlationId = ++this.correlationId;

    const onpacket = (buffer) => {
      this.ps.removeListener('packet', onpacket);
      const responseCorrelationId  = buffer.readInt32BE(0);

      if (correlationId === responseCorrelationId) {
        const response = new Response(buffer, apiKey, apiVersion);
        const data = response.read();
        callback(null, data);
      }
    };

    this.ps.on('packet', onpacket);

    const buffer = Request.createBuffer(apiKey, apiVersion, correlationId, payload);
    this.write(buffer);
  }

  close() {
    this.socket.destroy();
  }

}

module.exports = Client;