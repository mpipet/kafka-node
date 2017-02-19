const Decoder = require('./Decoder');
const Encoder = require('./Encoder');

const net = require('net');
 
const CLIENT_ID = 'KAFKA_NODE';
const API_VERSION = 2;

const MAGIC_BYTE = 1;

const PRODUCE_REQUEST = 0;
const METADATA_REQUEST = 3;

const apiVersion = API_VERSION;
const correlationId = 666;
const clientId = CLIENT_ID;
const requiredAcks = 1;
const timeout = 1000;


const printHex = function(buff, offset) {
	console.log(offset.toString() + ': ' + buff.toString('hex'));
};





const topics = [
	'live',
	'live2'
];

const encoder = new Encoder();
// Get Buffer size
const topicMetadataRequestSize = encoder.getTopicMetadataRequestSize(topics);
const requestMessageSize = encoder.getRequestMessageSize(clientId, topicMetadataRequestSize);
const requestSize = encoder.getRequestOrResponseSize(requestMessageSize);

const buff = Buffer.alloc(requestSize);

let offset = 0;
// Write to Buffer
offset = encoder.writeRequestOrResponse(buff, offset, requestMessageSize);
offset = encoder.writeRequestMessage(buff, offset, METADATA_REQUEST, apiVersion, correlationId, clientId);
offset = encoder.writeTopicMetadataRequest(buff, offset, topics);


const sock = new net.Socket()

//sync produce with ack prototype

// Produce
sock.connect(9092, '192.168.33.33', () => {
	sock.write(buff);
});




const WAITING_RESPONSE_SIZE = 0;
const WAITING_PACKET = 1;
let state = WAITING_RESPONSE_SIZE;
let responseSize = 0;
let response = null;


// sock.on('data', (data) => {
// 	console.log('wiiin');
// 	printHex(data);
// });

sock.on('readable', () => {
	// Wait for full response :p Thx TSY

 	while (response === null) { 		
	 	switch(state) {
			case WAITING_RESPONSE_SIZE:
				const size = sock.read(4);
				if(size === null) return;
				responseSize = size.readInt32BE(0);
				state = WAITING_PACKET;
				break;
			case WAITING_PACKET:
				response = sock.read(responseSize);
				if(response === null) return;
				break;
		}
 	}
 	// Decode response
 	const decoder = new Decoder(response);
 	const data = decoder.readTopicMetadataResponse();
 	console.log(JSON.stringify(data));
 	// printHex(response, 0);
	sock.end();
});






















// const payload = [
// 	{
// 		topic: 'live2',
// 		partitions: [
// 			{
// 				partition: 1,
// 				messages: [
// 					{
// 						'offset': 0,
// 						'timestamp': 100,
// 						'key': 'erg',
// 						'value': 'loooolfzefzefzfzf'		
// 					}
// 				]
// 			},
// 			{
// 				partition: 2,
// 				messages: [
// 					{
// 						'offset': 0,
// 						'timestamp': 1000,
// 						'key': 'ergree',
// 						'value': 'gegrr'		
// 					}

// 				]
// 			}

// 		]	
// 	}
// ];

// const apiKey = PRODUCE_REQUEST;
// const apiVersion = API_VERSION;
// const correlationId = 666;
// const clientId = CLIENT_ID;
// const requiredAcks = 1;
// const timeout = 1000;

// const encoder = new Encoder();
// // Get Buffer size
// const produceRequestSize = encoder.getProduceRequestSize(payload);
// const requestMessageSize = encoder.getRequestMessageSize(clientId, produceRequestSize);
// const requestSize = encoder.getRequestOrResponseSize(requestMessageSize);

// const buff = Buffer.alloc(requestSize);

// let offset = 0;
// // Write to Buffer
// offset = encoder.writeRequestOrResponse(buff, offset, requestMessageSize);
// offset = encoder.writeRequestMessage(buff, offset, PRODUCE_REQUEST, apiVersion, correlationId, clientId);
// offset = encoder.writeProduceRequest(buff, offset, requiredAcks, timeout, payload);

// const sock = new net.Socket()

// //sync produce with ack prototype

// // Produce
// sock.connect(9092, '192.168.33.33', () => {
// 	sock.write(buff);
// });

// const WAITING_RESPONSE_SIZE = 0;
// const WAITING_PACKET = 1;
// let state = WAITING_RESPONSE_SIZE;
// let responseSize = 0;
// let response = null;
// sock.on('readable', () => {
// 	// Wait for full response :p Thx TSY
//  	while (response === null) { 		
// 	 	switch(state) {
// 			case WAITING_RESPONSE_SIZE:
// 				const size = sock.read(4);
// 				if(size === null) return;
// 				responseSize = size.readInt32BE(0);
// 				state = WAITING_PACKET;
// 				break;
// 			case WAITING_PACKET:
// 				response = sock.read(responseSize);
// 				if(response === null) return;
// 				break;
// 		}
//  	}

//  	// Decode response
//  	const decoder = new Decoder(response);
//  	const data = decoder.readProduceResponse();
//  	console.log(data);
// 	sock.end();
// });