const Client = require('../../Client');

const cst = require('../../protocol/constants');
const ProduceResponse = require('../../protocol/ProduceResponse');
const ProduceRequest = require('../../protocol/ProduceRequest');


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

const produceRequest = new ProduceRequest(cst.API_VERSION, correlationId, cst.CLIENT_ID);
const size = produceRequest.getSize(payload);
const requestPayload = produceRequest.getRequestPayload(size, payload);
const buff = Buffer.alloc(size);
const offset = produceRequest.write(buff, requestPayload, 0);

const client = new Client();
client.connect(() => {
	client.send(buff);
});

client.on('response', (response) => {
	const produceResponse = new ProduceResponse(response);
	const data = produceResponse.read();
	console.log(JSON.stringify(data, null, 2));
	client.close();

});