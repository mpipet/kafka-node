const _ = require('underscore');

const Request = require('./Request');
const cst = require('./constants');

const schema = {
	acks: 'int16',
	timeout: 'int32',
	topic_data: {
		Array: {
			topic: 'string',
			data: {
				Array: {
					partition: 'int32',
					record_set: {
						Batch: {
							offset: 'int64',
							Size: {
								Crc: {
									magic_byte: 'int8',
									attributes: 'int8',
									timestamp: 'int64',
									key: 'bytes',
									value: 'bytes'
								}
							}
						}
					}
				}
			}
		}
	},

};

class ProduceRequest extends Request {

	constructor(apiVersion, correlationId, clientId) {
		super(schema, cst.PRODUCE_REQUEST, apiVersion, correlationId, clientId);
	}
}

module.exports = ProduceRequest;