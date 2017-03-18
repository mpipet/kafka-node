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

const requiredAcks = 1;
const correlationId = 666;

const produceRequest = new ProduceRequest(payload, cst.API_VERSION, correlationId, cst.CLIENT_ID);
produceRequest.writeRequestMessage();

const client = new Client();
client.connect(() => {
	client.send(produceRequest.buff);
});

client.on('response', (response) => {
	const produceResponse = new ProduceResponse(response);
	const data = produceResponse.read();
	console.log(JSON.stringify(data));	
	client.close();

});