const Client = require('../../Client');

const cst = require('../../protocol/constants');
const Response = require('../../protocol/Response');
const Request = require('../../protocol/Request');

const payload = {
	controller_id: 0,
  	controller_epoch: 10,
	partition_states: [
		{
			topic: 'test',
			partition: 0,
			controller_epoch: 10,
			leader: 0,
			leader_epoch: 0,
			isr: [
				0
			],
			zk_version: 0,
			replicas: [
				0
			],
		}
	],
	live_leaders: [
		{
			id: 0,
			host: '192.168.33.33',
			port: 2181,
		}
	]
};

const correlationId = 666;

const request = new Request(cst.LEADER_AND_ISR, 0, cst.CLIENT_ID);
const requestPayload = request.getRequestPayload(payload, correlationId);

const size = request.getSize(payload);
const buff = Buffer.alloc(size);
const offset = request.write(buff, requestPayload, 0);


const client = new Client('192.168.50.10:9092');

client.send_to_broker(buff, (buff) => {
	const response = new Response(buff, cst.LEADER_AND_ISR, 0);
	const data = response.read();
	console.log(JSON.stringify(data, null, 2));
})