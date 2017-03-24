const Client = require('../../Client');

const cst = require('../../protocol/constants');
const FetchResponse = require('../../protocol/FetchResponse');
const FetchRequest = require('../../protocol/FetchRequest');

const payload = {
	replica_id: -1,
  	max_wait_time: 10,
  	min_bytes: 10,
	topics: [
		{
			topic: 'test',
			partitions: [
				{
					partition: 1,
					fetch_offset: 24,
					max_bytes: 300000,
				}
			]
		}
	]
};

const correlationId = 666;

const fetchRequest = new FetchRequest(cst.API_VERSION, correlationId, cst.CLIENT_ID);
const size = fetchRequest.getSize(payload);
const requestPayload = fetchRequest.getRequestPayload(size, payload);
const buff = Buffer.alloc(size);
const offset = fetchRequest.write(buff, requestPayload, 0);

const client = new Client();
client.connect(() => {
	client.send(buff);
});

client.on('response', (response) => {
	console.log(response.toString('hex'))
	const fetchResponse = new FetchResponse(response);
	const data = fetchResponse.read();
	console.log(JSON.stringify(data, null, 2));	
	client.close();

});