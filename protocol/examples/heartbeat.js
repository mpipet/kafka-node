const Client = require('../../Client');

const cst = require('../../protocol/constants');
const Response = require('../../protocol/Response');
const Request = require('../../protocol/Request');

const payload = {
	group_id:  'group-test',
	group_generation_id:  1,
	member_id:  'KAFKA_NODE-a61d7caf-2eb2-4b9b-acc8-596eb8c126fb',

};


const correlationId = 666;

const request = new Request(cst.HEARTBEAT, 0, cst.CLIENT_ID);
const requestPayload = request.getRequestPayload(payload, correlationId);

const size = request.getSize(payload);
const buff = Buffer.alloc(size);
const offset = request.write(buff, requestPayload, 0);

const client = new Client('192.168.50.10:9092');

client.send_to_broker(buff, (buff) => {
    const response = new Response(buff, cst.HEARTBEAT, 0);
    const data = response.read();
    console.log(JSON.stringify(data, null, 2));
})