const Client = require('../../Client');

const cst = require('../../protocol/constants');
const Response = require('../../protocol/Response');
const Request = require('../../protocol/Request');

const payload = {
	group_id:  'group-test',
	session_timeout:  30000,
	rebalance_timeout:  40000,
	member_id:  '', // new consumer
	protocol_type:  'consumer',
	group_protocols: [
		{
			protocol_name: 'consumer',
			protocol_metadata: 'zf', //???
		},
		{
			protocol_name: 'connect',
			protocol_metadata: 'fzef',
		}
	]
};


const correlationId = 666;

const request = new Request(cst.JOIN_GROUP, 1, cst.CLIENT_ID);
const requestPayload = request.getRequestPayload(payload, correlationId);

const size = request.getSize(payload);
const buff = Buffer.alloc(size);
const offset = request.write(buff, requestPayload, 0);

const client = new Client();
client.connect(() => {
	client.send(buff);
});

client.on('response', (buff) => {
	const response = new Response(buff, cst.JOIN_GROUP, 1);
	const data = response.read();
	console.log(JSON.stringify(data, null, 2));
	client.close();

});