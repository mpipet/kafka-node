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
    this.socket.once('end', () => this.onend());
    this.socket.once('close', () => this.onclose());
  }

  onpacket(buffer) {
    this.emit('response', buffer);
  }

  onerror(err) {
    this.emit('error', err);
  }

  onend() {
    this.emit('end');
  }

  onclose() {
    this.socket.removeListener('error', this.onerror);
    this.socket.removeListener('end', this.onend);
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
    payload.correlation_id = correlationId;

    // const onend = () => {
    //   callback('Broker disconnected', null);
    // }

    const onpacket = (buffer) => {
      this.ps.removeListener('packet', onpacket);
      // this.socket.removeListener('end', onend);
      const respCorrelationId  = buffer.readInt32BE(0);

      if (correlationId === respCorrelationId) {
        const response = new Response(buffer, apiKey, apiVersion);
        //@TODO see what to do with correlation id in response parser
        response.offset = 4;
        const data = response.read();

        callback(null, data);
      }
    };

    // this.socket.once('end', onend);

    this.ps.on('packet', onpacket);

    const buffer = Request.createBuffer(apiKey, apiVersion, correlationId, payload);
    this.write(buffer);
  }

  close() {
    this.socket.destroy();
  }

}

module.exports = Client;