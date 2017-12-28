const Client = require('../../Client');

const cst = require('../../protocol/constants');
const Response = require('../../protocol/Response');
const Request = require('../../protocol/Request');

const payload = {
	replica_id: -1,
	topics: [
		{
			topic: 'live-deliveries',
			partitions: [
				{
					partition: 0,
					timestamp: -1
				}
			]
		}
	]
};

const correlationId = 666;

const request = new Request(cst.OFFSETS, 1, cst.CLIENT_ID);
const requestPayload = request.getRequestPayload(payload, correlationId);

const size = request.getSize(requestPayload);
const buff = Buffer.alloc(size);
const offset = request.write(buff, requestPayload, 0);
console.log(buff.toString('hex'));
const client = new Client('192.168.50.10:9092');

client.send_to_broker(buff, (buff) => {
	const response = new Response(buff, cst.OFFSETS, 1);
	const data = response.read();
	console.log(JSON.stringify(data, null, 2));
})