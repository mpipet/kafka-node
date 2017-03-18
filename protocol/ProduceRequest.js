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

	constructor(payload, apiVersion, correlationId, clientId) {
		super(schema, cst.PRODUCE_REQUEST, payload, apiVersion, correlationId, clientId);
	}

	//@TODO make message and messageSet independant with their own methods and schema
	writeMessageSet(buff, messages, offset) {
		const messageSetSize = this.getMessageSetSize(messages);
		this.offset = this.writeInt32(this.buff, messageSetSize, this.offset);		
		messages.forEach((message) => {
			this.offset = this.writeInt64(this.buff, message.offset, this.offset);
			const messageSize = this.getMessageSize(message);
			this.offset = this.writeInt32(this.buff, messageSize, this.offset);
			this.offset = this.writeMessage(this.buff, message, this.offset);
		});
		return this.offset;
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
		this.offset = this.writeInt32(this.buff, msgCrc, this.offset);
		this.offset += msg.copy(this.buff, this.offset, 0, msg.length);
		return this.offset;
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