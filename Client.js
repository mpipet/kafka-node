const net = require('net');
const EventEmitter = require('events').EventEmitter;

const Request = require('./protocol/Request');
const Response = require('./protocol/Response');
const cst = require('./protocol/constants');
const _ = require('lodash');

class Client extends EventEmitter{

  constructor(bootstrap_servers) {
    super();
    const servers = bootstrap_servers.split(',');
    this.brokersConfig = servers.map((host) => {
      const tmp = host.split(':');
      return {host: tmp[0], port: tmp[1]};
    });
  }

  send(buff, callback) {
    const brokerIndex = Math.floor(Math.random() * (this.brokersConfig.length - 0) + 0);

    const brokerConf = this.brokersConfig[brokerIndex]; 
    const sock = new net.Socket();

    this.on('response', (buff) => {
      sock.destroy();
      callback(buff);
    });

    sock.connect(brokerConf.port, brokerConf.host, () => {
      sock.write(buff, () => this.read(sock));
    });       
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
            const size = sock.read(4);
            if(size === null) return;
            responseSize = size.readInt32BE(0);
            state = WAITING_PACKET;
            break;
          case WAITING_PACKET:
            response = sock.read(responseSize);
            
            if(response === null) return;
            this.emit('response', response);
            break;
        }
      }
    });

  }

  getMetadatas(topics, callback) {
      const payload = {
          topics: topics
      };

      const correlationId = 666;

      const metadataRequest = new Request(cst.METADATA, 2, cst.CLIENT_ID);
      const requestPayload = metadataRequest.getRequestPayload(payload, correlationId);

      const size = metadataRequest.getSize(requestPayload);
      const buff = Buffer.alloc(size);
      const offset = metadataRequest.write(buff, requestPayload, 0);
      this.send(buff, (buff) => {
          const metadataResponse = new Response(buff, cst.METADATA, 2);
          const data = metadataResponse.read();
          data.topic_metadata = _.filter(data.topic_metadata, ['is_internal', false]);
          callback(data); 
      })
  } 
}

module.exports = Client;