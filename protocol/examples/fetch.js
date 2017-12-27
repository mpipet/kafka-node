const Client = require('../../Client');

const cst = require('../../protocol/constants');
const Response = require('../../protocol/Response');
const Request = require('../../protocol/Request');

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
					fetch_offset: 0,
					max_bytes: 300000,
				}
			]
		}
	]
};

const correlationId = 666;

const fetchRequest = new Request(cst.FETCH, 2, cst.CLIENT_ID);
const requestPayload = fetchRequest.getRequestPayload(payload, correlationId);

const size = fetchRequest.getSize(payload);
const buff = Buffer.alloc(size);
const offset = fetchRequest.write(buff, requestPayload, 0);

const client = new Client('192.168.50.10:9092');

client.send_to_broker(buff, (buff) => {
    const response = new Response(buff, cst.FETCH, 0);
    const data = response.read();
    console.log(JSON.stringify(data, null, 2));
})