const Client = require('../../Client');

const cst = require('../../protocol/constants');
const Response = require('../../protocol/Response');
const Request = require('../../protocol/Request');

const correlationId = 666;

const payload = {
	topics: [
		'live-deliveries'
	]
};

const metadataRequest = new Request(cst.METADATA, 2, cst.CLIENT_ID);
const requestPayload = metadataRequest.getRequestPayload(payload, correlationId);

const size = metadataRequest.getSize(requestPayload);
const buff = Buffer.alloc(size);
const offset = metadataRequest.write(buff, requestPayload, 0);

const client = new Client('192.168.50.10:9092');

client.send(buff, (buff) => {
    const metadataResponse = new Response(buff, cst.METADATA, 2);
    const data = metadataResponse.read();
    console.log(JSON.stringify(data, null, 2)); 
})