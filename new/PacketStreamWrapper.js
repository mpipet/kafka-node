const EventEmitter = require('events').EventEmitter;

const WAITING_RESPONSE_SIZE = 0;
const WAITING_PACKET = 1;

class PacketStreamWrapper extends EventEmitter {

  constructor(stream) {
    super();
    let responseSize = 0;
    let response = null;
    let state = WAITING_RESPONSE_SIZE;

    this.stream = stream;

    this.stream.on('readable', () => {     
      while (true) {     
        switch(state) {
          case WAITING_RESPONSE_SIZE:
            const size = this.stream.read(4);
            if(size === null) return;
            responseSize = size.readInt32BE(0);
            state = WAITING_PACKET;
            break;
          case WAITING_PACKET:
            response = this.stream.read(responseSize);
            if(response === null) return;
            this.emit('packet', response);
            state = WAITING_RESPONSE_SIZE;
            break;
        }
      }
    });

  }

  write(buf) {
    const header = new Buffer(4);
    header.writeUInt32BE(buf.length, 0);
    this.stream.write(Buffer.concat([header, buf]));
  }

}

module.exports = PacketStreamWrapper;