const Client = require('../../Client');

const cst = require('../../protocol/constants');
const Response = require('../../protocol/Response');
const Request = require('../../protocol/Request');


const payload ={
	acks: -1,
	timeout: 1000,
	topic_data: [
		{
			topic: 'test',
			data: [
				{
					partition: 1,
					record_set: [
						{
							'offset': 0,
							'magic_byte': 1,
							'attributes': 0,
							'timestamp': Date.now() / 1000 | 0,
							'key': 'erg',
							'value': 'loooolfzefzefzfzf'		
						}
					]
				},
				{
					partition: 0,
					record_set: [
						{
							'offset': 2,
							'magic_byte': 1,
							'attributes': 0,
							'timestamp': Date.now() / 1000 | 0,
							'key': 'ergree',
							'value': 'gegrr'		
						}

					]
				}

			]	
		}
	]
};

const correlationId = 666;

const request = new Request(cst.PRODUCE, 2, cst.CLIENT_ID);
const requestPayload = request.getRequestPayload(payload, correlationId);

const size = request.getSize(payload);
const buff = Buffer.alloc(size);
const offset = request.write(buff, requestPayload, 0);

const client = new Client('192.168.50.10:9092');

client.send_to_broker(buff, (buff) => {
	const response = new Response(buff, cst.PRODUCE, 2);
	const data = response.read();
	console.log(JSON.stringify(data, null, 2));
})