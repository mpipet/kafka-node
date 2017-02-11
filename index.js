const _ = require('underscore');
const crc32 = require('crc-32');
const net = require('net');
 
const CLIENT_ID = 'KAFKA_NODE';
const API_VERSION = 2;

const MAGIC_BYTE = 1;

const PRODUCE_REQUEST = 0;

const printHex = function(buff, offset) {
	console.log(offset.toString() + ': ' + buff.toString('hex'));
};


class Encoder {

	writeRequestOrResponse(buff, offset, requestMessageSize) {
		return this.writeInt32(buff, offset, requestMessageSize);
	}

	writeRequestMessage(buff, offset, apiKey, apiVersion, correlationId, clientId) {
		offset = this.writeInt16(buff, offset, apiKey);
		offset = this.writeInt16(buff, offset, apiVersion);
		offset = this.writeInt32(buff, offset, correlationId);
		return  this.writeString(buff, offset, clientId);
	}

	writeProduceRequest(buff, offset, requiredAcks, timeout, payload) {
		offset = this.writeInt16(buff, offset, requiredAcks);
		offset = this.writeInt32(buff, offset, timeout);
		return this.writeTopics(buff, offset, payload);
	}

	writeTopics(buff, offset, topics) {
		offset = this.writeInt32(buff, offset, topics.length);

		topics.forEach((topic) => {			
			offset = this.writeString(buff, offset, topic.topic);
			offset = this.writePartitions(buff, offset, topic.partitions);
		});
		return offset;
	}

	writePartitions(buff, offset, partitions) {
		offset = this.writeInt32(buff, offset, partitions.length);

		partitions.forEach((partition) => {			
			offset = this.writeInt32(buff, offset, partition.partition);
			const messageSetSize = this.getMessageSetSize(partition.messages);
			offset = this.writeInt32(buff, offset, messageSetSize);
			offset = this.writeMessageSet(buff, offset, partition.messages);
		});
		return offset;
	}

	writeMessageSet(buff, offset, messages) {

		messages.forEach((message) => {
			offset = this.writeInt64(buff, offset, message.offset);
			const messageSize = this.getMessageSize(message.key, message.value);
			offset = this.writeInt32(buff, offset, messageSize);
			offset = this.writeMessage(buff, offset, message.timestamp, message.key, message.value);
		});

		return offset;
	}

	writeMessage(buff, offset, timestamp, key, value) {
		const messageSize = this.getMessageSize(key, value);
		const msg = Buffer.alloc(messageSize - 4);
		let msgOffset = 0;
		msgOffset = this.writeInt8(msg, msgOffset, MAGIC_BYTE);
		msgOffset = this.writeInt8(msg, msgOffset, 0);
		msgOffset = this.writeInt64(msg, msgOffset, timestamp);
		msgOffset = this.writeBytes(msg, msgOffset, key);
		msgOffset = this.writeBytes(msg, msgOffset, value);

		const msgCrc = crc32.buf(msg);
		offset = this.writeInt32(buff, offset, msgCrc);
		offset += msg.copy(buff, offset, 0, msg.length);
		return offset;
	}

	getRequestOrResponseSize(messageSize) {
		// messageSize as int32 + messageSize
		return 4 + messageSize;
	} 

	getRequestMessageSize(clientId, requestMessageSize) {
		// apiKey as int16 + apiversion as int16 + correlationid as int32 + clientId as string + requestMessageSize
		return 2 + 2 + 4 + (2 + clientId.length) + requestMessageSize;
	}

	getProduceRequestSize(payload) {
		const topicArraySize = _.reduce(payload, (memo, topic) => {

			const partitionsArraySize = _.reduce(topic.partitions, (memo, partition) => {
				// partition as int32 + messagetSetSize as int32 + messageSetSize
				return memo + 4 + 4 + this.getMessageSetSize(partition.messages);
			}, 0);

			// topicName as string + partitionsArraySize as int32 + partitionsArraySize 
			return memo + (2 + topic.topic.length) + 4 + partitionsArraySize;
		}, 0);

		// requiredAcks as int16 + timeout as int32 + topicArraySize as int32 + topicArraySize
		return 2 + 4 + 4 + topicArraySize;
	}


	getMessageSize(key, value) {
		// crc as int32 + magicByte as int8 + attributes as int8 + timestamp as int64 + key as bytes + value as bytes 
		return 4 + 1 + 1 + 8 + (4 + key.length) + (4 + value.length);		
	}

	getMessageSetSize(messages) {
		return _.reduce(messages, (memo, message) => { 
			// offset as int64 + message size as int32 + message size    
			return memo + 8 + 4 + this.getMessageSize(message.key, message.value);			
		}, 0);
	}

	writeInt8(buff, offset, integer) {
		return buff.writeIntBE(integer, offset, 1);
	}

	writeInt16(buff, offset, integer) {
		return buff.writeInt16BE(integer, offset);
	}

	writeInt32(buff, offset, integer) {
		return buff.writeInt32BE(integer, offset);
	}

	writeInt64(buff, offset, integer) {
		return buff.writeIntBE(integer, offset, 8);
	}

	writeString(buff, offset, string) {
		offset = this.writeInt16(buff, offset, string.length);
		offset += buff.write(string, offset, string.length);
		return offset;
	}

	writeBytes(buff, offset, string) {
		offset = this.writeInt32(buff, offset, string.length);
		offset += buff.write(string, offset, string.length);
		return offset;
	}

}

class Decoder {

	constructor(buff) {
		this.buff = buff;
		this.offset = 0;
	}

	readProduceResponse() {		
		return {
			correlationId: this.readInt32(),
			topics: this.readTopics(),
			throttleTime: this.readInt32()
		};
	}

	readTopics() {
		const count = this.readInt32();
		const topics = [];
		_.range(count).forEach(() => {			
			const topic = {
				topic: this.readString(),
				partitions: this.readPartitions()
			};
			topics.push(topic);
		});
		return topics;
	}

	readPartitions() {
		const count = this.readInt32();
		const partitions = [];
		_.range(count).forEach(() => {			
			const partition = {
				partition: this.readInt32(),			
				errorCode: this.readInt16(),
				offset: this.readInt64(),
				timestamp: this.readInt64()
			};
			partitions.push(partition);
		});

		return partitions;
	}

	readInt8() {		
		const integer = this.buff.readIntBE(this.offset, 1);
		this.offset += 1;
		return integer;
	}

	readInt16() {
		const integer = this.buff.readIntBE(this.offset, 2);
		this.offset += 2;
		return integer;
	}

	readInt32() {
		const integer = this.buff.readIntBE(this.offset, 4);
		this.offset += 4;
		return integer;
	}

	readInt64() {
		const integer = this.buff.readIntBE(this.offset, 8);
		this.offset += 8;
		return integer;
	}

	readString() {
		const size = this.buff.readIntBE(this.offset, 2);
		this.offset += 2;
		const string = this.buff.toString('utf-8', this.offset, this.offset + size);
		this.offset += size;
		return string;
	}

	readBytes() {
		const size = this.buff.readIntBE(this.offset, 4);
		this.offset += 4;
		const string = this.buff.toString('utf-8', this.offset, this.offset + size);
		this.offset += size;
		return string;
	}
}

const payload = [
	{
		topic: 'live2',
		partitions: [
			{
				partition: 1,
				messages: [
					{
						'offset': 0,
						'timestamp': 100,
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
						'timestamp': 1000,
						'key': 'ergree',
						'value': 'gegrr'		
					}

				]
			}

		]	
	}
];

const apiKey = PRODUCE_REQUEST;
const apiVersion = API_VERSION;
const correlationId = 666;
const clientId = CLIENT_ID;
const requiredAcks = 1;
const timeout = 1000;

const encoder = new Encoder();
// Get Buffer size
const produceRequestSize = encoder.getProduceRequestSize(payload);
const requestMessageSize = encoder.getRequestMessageSize(clientId, produceRequestSize);
const requestSize = encoder.getRequestOrResponseSize(requestMessageSize);

const buff = Buffer.alloc(requestSize);

let offset = 0;
// Write to Buffer
offset = encoder.writeRequestOrResponse(buff, offset, requestMessageSize);
offset = encoder.writeRequestMessage(buff, offset, apiKey, apiVersion, correlationId, clientId);
offset = encoder.writeProduceRequest(buff, offset, requiredAcks, timeout, payload);

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
 	const data = decoder.readProduceResponse();
 	console.log(data);
	sock.end();
});