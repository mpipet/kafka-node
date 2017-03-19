const Client = require('../../Client');

const cst = require('../../protocol/constants');
const ProduceResponse = require('../../protocol/ProduceResponse');
const ProduceRequest = require('../../protocol/ProduceRequest');


const payload ={
	acks: 1,
	timeout: 1000,
	topics: [
		{
			topic: 'live2',
			partitions: [
				{
					partition: 1,
					messages: [
						{
							'offset': 0,
							'timestamp': 1487542182,
							'key': 'erg',
							'value': 'loooolfzefzefzfzf'		
						}
					]
				},
				{
					partition: 2,
					messages: [
						{
							'offset': 0,
							'timestamp': 1487542182,
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
	console.log(JSON.stringify(data));
	client.close();

});