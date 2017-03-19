const _ = require('underscore');
const Request = require('./Request');
const cst = require('./constants');

const schema = {
	topics: {
		Array: 'string'
	}
};
/*
var schema = {
	brokers: {			
			node_id: 'int32',
			host: 'string',
			port: 'int32'
	},
	topic_metadata: {
			topic_error_code: 'int16',
			topic: 'string',
			partition_metadata: {
				partition_error_code: 'int16',
				partition_id: 'int32',
				leader: 'int32',
				replicas: {
					replicas: 'int32'
				},
				isr: {
					isr: 'int32'
				}
			}		
	}


};*/
class MetadataRequest extends Request {
	constructor(apiVersion, correlationId, clientId) {
		super(schema, cst.METADATA_REQUEST, apiVersion, correlationId, clientId);
	}
}

module.exports = MetadataRequest;