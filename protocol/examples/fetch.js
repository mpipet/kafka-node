const Client = require('../../Client');

const cst = require('../../protocol/constants');
const FetchResponse = require('../../protocol/FetchResponse');
const FetchRequest = require('../../protocol/FetchRequest');

const printHex = function(buff, offset) {
	console.log(offset.toString() + ': ' + buff.toString('hex'));
};

const topics = [
	{
		topic: 'live2',
		partitions: [
			{
				partition: 1,
				fetchOffset: 360,
				maxBytes: 300000,
			}
		]
	}
];

const replicaId = -1;
const maxWaitTime = 10;
const minBytes = 10;
const maxBytes = 100000;

const correlationId = 666;
const timeout = 1000;

const fetchRequest = new FetchRequest();
// Get Buffer size
const fetchRequestSize = fetchRequest.getSize(topics);
const requestMessageSize = fetchRequest.getRequestMessageSize(cst.CLIENT_ID, fetchRequestSize);
const requestSize = fetchRequest.getRequestOrResponseSize(requestMessageSize);

const buff = Buffer.alloc(requestSize);

let offset = 0;
// Write to Buffer
offset = fetchRequest.writeRequestOrResponse(buff, offset, requestMessageSize);
offset = fetchRequest.writeRequestMessage(buff, offset, cst.FETCH_REQUEST, cst.API_VERSION, correlationId, cst.CLIENT_ID);
offset = fetchRequest.write(buff, offset, replicaId, maxWaitTime, minBytes, topics);



const client = new Client();
client.connect(() => {
	client.send(buff);
});

client.on('response', (response) => {
	const fetchResponse = new FetchResponse(response);
	const data = fetchResponse.read();
	console.log(JSON.stringify(data));	
	client.close();

});