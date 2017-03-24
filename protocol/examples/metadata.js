const Client = require('../../Client');

const cst = require('../../protocol/constants');
const MetadataResponse = require('../../protocol/MetadataResponse');
const MetadataRequest = require('../../protocol/MetadataRequest');

const correlationId = 666;

const payload = {
	topics: [
		'test',
		'live2'
	]
};

const metadataRequest = new MetadataRequest(cst.API_VERSION, correlationId, cst.CLIENT_ID);
const size = metadataRequest.getSize(payload);
const requestPayload = metadataRequest.getRequestPayload(size, payload);
const buff = Buffer.alloc(size);
const offset = metadataRequest.write(buff, requestPayload, 0);

const client = new Client();
client.connect(() => {
	client.send(buff);
});

client.on('response', (response) => {
	const metadataResponse = new MetadataResponse(response);
	const data = metadataResponse.read();
	console.log(JSON.stringify(data, null, 2));	
	client.close();

});
