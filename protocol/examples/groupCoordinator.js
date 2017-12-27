const Client = require('../../Client');

const cst = require('../../protocol/constants');
const Response = require('../../protocol/Response');
const Request = require('../../protocol/Request');

const payload = {
	group_id:  'group-test'
};


const correlationId = 666;

const request = new Request(cst.GROUP_COORDINATOR, 0, cst.CLIENT_ID);
const requestPayload = request.getRequestPayload(payload, correlationId);

const size = request.getSize(payload);
const buff = Buffer.alloc(size);
const offset = request.write(buff, requestPayload, 0);

const client = new Client('192.168.50.10:9092');

client.send_to_broker(buff, (buff) => {
    const response = new Response(buff, cst.GROUP_COORDINATOR, 0);
    const data = response.read();
    console.log(JSON.stringify(data, null, 2));
})