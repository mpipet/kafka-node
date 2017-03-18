const Client = require('../../Client');

const cst = require('../../protocol/constants');
const MetadataResponse = require('../../protocol/MetadataResponse');
const MetadataRequest = require('../../protocol/MetadataRequest');

const correlationId = 666;

const payload = {
	topics: [
		'live',
		'live2'
	]
};

const metadataRequest = new MetadataRequest(payload, cst.API_VERSION, correlationId, cst.CLIENT_ID);

metadataRequest.writeRequestMessage();

const client = new Client();
client.connect(() => {
	client.send(metadataRequest.buff);
});

client.on('response', (response) => {
	const metadataResponse = new MetadataResponse(response);
	const data = metadataResponse.read();
	console.log(JSON.stringify(data));	
	client.close();

});
