const Client = require('../../Client');

const cst = require('../../protocol/constants');
const Response = require('../../protocol/Response');
const Request = require('../../protocol/Request');

const payload = {
    consumer_group: 'live-deliveries',
    topics: [
        {
            topic: 'live-deliveries',
            partitions: [
                0
            ]
        }
    ]
};

const correlationId = 666;

const request = new Request(cst.OFFSETS_FETCH, 1, cst.CLIENT_ID);
const requestPayload = request.getRequestPayload(payload, correlationId);

const size = request.getSize(payload);
const buff = Buffer.alloc(size);
const offset = request.write(buff, requestPayload, 0);
const client = new Client('192.168.50.10:9092');

client.send_to_broker(buff, (buff) => {
    console.log('buff', buff.toString('hex'))
    const response = new Response(buff, cst.OFFSETS_FETCH, 1);
    const data = response.read();
    console.log(JSON.stringify(data, null, 2));
})