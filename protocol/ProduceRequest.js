const _ = require('underscore');
const crc32 = require('crc-32');

const Request = require('./Request');
const cst = require('./constants');

const MAGIC_BYTE = 1;

const schema = {
	acks: 'int16',
	timeout: 'int32',
	topics: {
		Array: {
			topic: 'string',
			partitions: {
				Array: {
					//@TODO use documentation field names from http://kafka.apache.org/protocol.html#protocol_common
					partition: 'int32',
					//@TODO remove size from schema
					size: 'int32',
					messages: 'MessageSet'
				}
			}
		}
	},

};

class ProduceRequest extends Request {

	constructor(apiVersion, correlationId, clientId) {
		super(schema, cst.PRODUCE_REQUEST, apiVersion, correlationId, clientId);
	}

	//@TODO make message and messageSet independant with their own methods and schema
	writeMessageSet(buff, messages, offset) {
		const messageSetSize = this.getMessageSetSize(messages);
		offset = this.writeInt32(buff, messageSetSize, offset);		
		messages.forEach((message) => {
			offset = this.writeInt64(buff, message.offset, offset);
			const messageSize = this.getMessageSize(message);
			offset = this.writeInt32(buff, messageSize, offset);
			offset = this.writeMessage(buff, message, offset);
		});
		return offset;
	}

	writeMessage(buff, message, offset) {
		const messageSize = this.getMessageSize(message);
		const msg = Buffer.alloc(messageSize - 4);
		let msgOffset = 0;
		msgOffset = this.writeInt8(msg, MAGIC_BYTE, msgOffset);
		msgOffset = this.writeInt8(msg, 0, msgOffset);
		msgOffset = this.writeInt64(msg, message.timestamp, msgOffset);
		msgOffset = this.writeBytes(msg, message.key, msgOffset);
		msgOffset = this.writeBytes(msg, message.value, msgOffset);

		const msgCrc = crc32.buf(msg);
		offset = this.writeInt32(buff, msgCrc, offset);
		offset += msg.copy(buff, offset, 0, msg.length);
		return offset;
	}

	getMessageSize(message) {
		// crc as int32 + magicByte as int8 + attributes as int8 + timestamp as int64 + key as bytes + value as bytes 
		return 4 + 1 + 1 + 8 + (4 + message.key.length) + (4 + message.value.length);		
	}

	getMessageSetSize(messages) {
		return _.reduce(messages, (memo, message) => { 
			// offset as int64 + message size as int32 + message size    
			return memo + 8 + 4 + this.getMessageSize(message);			
		}, 0);
	}

}

module.exports = ProduceRequest;