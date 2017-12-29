const net = require('net');
const EventEmitter = require('events').EventEmitter;


const WAITING_RESPONSE_SIZE = 0;
const WAITING_PACKET = 1;

class PacketStreamWrapper extends EventEmitter{
  constructor(stream) {
    let responseSize = 0;
    let response = null;

    this.stream = stream;

    this.stream.on('readable', () => {     
      // Wait for full response :p Thx TSY
      while (response === null) {     
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
            this.emit('response', response);
            break;
        }
      }
    });

  }

  send(buf) {
    const header = new Buffer(4);
    header.writeUInt32BE(buf.length, 0);
    this.stream.write(Buffer.concat([header, buf]));
  }

}


















// class Connection extends EventEmitter {

//   constructor() {
//     super();
//     this.sock = null;
//   }

//   connect(broker, callback) {
//     const tmp = broker.split(':');
//     const options = {
//       hostname: tmp[0],
//       port: tmp[1]
//     };

//     const sock = net.createConnection(options, () => {

//       sock.on('readable', () => {

//       });

//       sock.on('close', () => {
//         this.emit('close');

//       });

//       sock.on('error', () => {

//       });


//     });



//     this.sock.connect(options.port, options.host, callback);
//   }

//   send(buff) {
//     this.sock.write(buff);
//   }

//   read() {
//     console.log('START READ');
//     const WAITING_RESPONSE_SIZE = 0;
//     const WAITING_PACKET = 1;
//     let state = WAITING_RESPONSE_SIZE;
//     let responseSize = 0;
//     let response = null;

//     this.sock.on('readable', () => {     
//       // Wait for full response :p Thx TSY
//       while (response === null) {     
//         switch(state) {
//           case WAITING_RESPONSE_SIZE:
//             const size = this.sock.read(4);
//             if(size === null) return;
//             responseSize = size.readInt32BE(0);
//             state = WAITING_PACKET;
//             break;
//           case WAITING_PACKET:
//             response = this.sock.read(responseSize);
            
//             if(response === null) return;
//             this.emit('response', response);
//             break;
//         }
//       }
//     });

//   }
// }

module.exports = Connection;