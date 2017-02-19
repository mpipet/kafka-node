const Client = require('../../Client');

const cst = require('../../protocol/constants');
const ProduceResponse = require('../../protocol/ProduceResponse');
const ProduceRequest = require('../../protocol/ProduceRequest');


const payload = [
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
];

const requiredAcks = 1;

const correlationId = 666;
const timeout = 1000;


const produceRequest = new ProduceRequest();
// Get Buffer size
const produceRequestSize = produceRequest.getSize(payload);
const requestMessageSize = produceRequest.getRequestMessageSize(cst.CLIENT_ID, produceRequestSize);
const requestSize = produceRequest.getRequestOrResponseSize(requestMessageSize);

const buff = Buffer.alloc(requestSize);

let offset = 0;
// Write to Buffer
offset = produceRequest.writeRequestOrResponse(buff, offset, requestMessageSize);
offset = produceRequest.writeRequestMessage(buff, offset, cst.PRODUCE_REQUEST, cst.API_VERSION, correlationId, cst.CLIENT_ID);
offset = produceRequest.write(buff, offset, requiredAcks, timeout, payload);



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