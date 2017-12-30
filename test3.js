const Client = require('./new/Client');

const cst = require('./new/protocol/constants');
const Response = require('./new/protocol/Response');
const Request = require('./new/protocol/Request');



const payload = {
    group_id:  'live-deliveries'
};

const options = {host: '192.168.33.33', port: 9092};

const client = new Client();
client.connect(options, () => {
    client.send(cst.FIND_COORDINATOR, 0, payload);
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