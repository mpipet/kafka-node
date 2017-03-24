const Client = require('../../Client');

const cst = require('../../protocol/constants');
const Response = require('../../protocol/Response');
const Request = require('../../protocol/Request');

const correlationId = 666;

const payload = {
	topics: [
		'test',
		'live2'
	]
};

const metadataRequest = new Request(cst.METADATA, cst.API_VERSION, cst.CLIENT_ID);
const requestPayload = metadataRequest.getRequestPayload(payload, correlationId);

const size = metadataRequest.getSize(payload);
const buff = Buffer.alloc(size);
const offset = metadataRequest.write(buff, requestPayload, 0);

const client = new Client();
client.connect(() => {
	client.send(buff);
});

client.on('response', (buff) => {
	const metadataResponse = new Response(buff, cst.METADATA, cst.API_VERSION);
	const data = metadataResponse.read();
	console.log(JSON.stringify(data, null, 2));	
	client.close();

});
