const _ = require('underscore');
const crc32 = require('crc-32');

const Request = require('./Request');


const MAGIC_BYTE = 1;

class ProduceRequest extends Request {

	write(buff, offset, requiredAcks, timeout, payload) {
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

	getSize(payload) {
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

}

module.exports = ProduceRequest;