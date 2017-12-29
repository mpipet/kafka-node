const Client = require('./new/Client');

const cst = require('./new/protocol/constants');
const Response = require('./new/protocol/Response');
const Request = require('./new/protocol/Request');



const payload = {
    group_id:  'live-deliveries'
};

const correlationId = 666;

const request = new Request(cst.FIND_COORDINATOR, 0, cst.CLIENT_ID);
const requestPayload = request.getRequestPayload(payload, correlationId);

const size = request.getSize(requestPayload);
const buffer = Buffer.alloc(size);
const offset = request.write(buffer, requestPayload, 0);


const options = {host: '192.168.50.10', port: 9092};
const client = new Client();
client.connect(options, () => {
    client.ps.send(buffer);
    console.log('sended');
});

client.on('response', (parsedData) => {
    console.log('response', parsedData);
    client.close();
})

client.sock.on('error', () => {
    console.log('error');
})

client.sock.on('close', () => {
    console.log('close');
})