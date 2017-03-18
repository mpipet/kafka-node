const Client = require('../../Client');

const cst = require('../../protocol/constants');
const FetchResponse = require('../../protocol/FetchResponse');
const FetchRequest = require('../../protocol/FetchRequest');

const printHex = function(buff, offset) {
	console.log(offset.toString() + ': ' + buff.toString('hex'));
};

const payload = {
	replica_id: -1,
  	max_wait_time: 10,
  	min_bytes: 10,
	topics: [
		{
			topic: 'live2',
			partitions: [
				{
					partition: 1,
					fetch_offset: 360,
					max_bytes: 300000,
				}
			]
		}
	]
};

const correlationId = 666;
const fetchRequest = new FetchRequest(payload, cst.API_VERSION, correlationId, cst.CLIENT_ID);

fetchRequest.writeRequestMessage();

const client = new Client();
client.connect(() => {
	client.send(fetchRequest.buff);
});

client.on('response', (response) => {
	const fetchResponse = new FetchResponse(response);
	const data = fetchResponse.read();
	console.log(JSON.stringify(data));	
	client.close();

});