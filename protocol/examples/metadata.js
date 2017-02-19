const Client = require('../../Client');

const cst = require('../../protocol/constants');
const MetadataResponse = require('../../protocol/MetadataResponse');
const MetadataRequest = require('../../protocol/MetadataRequest');

const correlationId = 666;
const requiredAcks = 1;
const timeout = 1000;

const topics = [
	'live',
	'live2'
];

const metadataRequest = new MetadataRequest();
// Get Buffer size
const topicMetadataRequestSize = metadataRequest.getSize(topics);
const requestMessageSize = metadataRequest.getRequestMessageSize(cst.CLIENT_ID, topicMetadataRequestSize);
const requestSize = metadataRequest.getRequestOrResponseSize(requestMessageSize);

const buff = Buffer.alloc(requestSize);

let offset = 0;
// Write to Buffer
offset = metadataRequest.writeRequestOrResponse(buff, offset, requestMessageSize);
offset = metadataRequest.writeRequestMessage(buff, offset, cst.METADATA_REQUEST, cst.API_VERSION, correlationId, cst.CLIENT_ID);
offset = metadataRequest.write(buff, offset, topics);



const client = new Client();
client.connect(() => {
	client.send(buff);
});

client.on('response', (response) => {
	const metadataResponse = new MetadataResponse(response);
	const data = metadataResponse.read();
	console.log(JSON.stringify(data));	
	client.close();

});
