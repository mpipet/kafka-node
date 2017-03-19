const _ = require('underscore');
const Request = require('./Request');
const cst = require('./constants');

const schema = {
	topics: {
		Array: 'string'
	}
};

class MetadataRequest extends Request {
	constructor(apiVersion, correlationId, clientId) {
		super(schema, cst.METADATA_REQUEST, apiVersion, correlationId, clientId);
	}
}

module.exports = MetadataRequest;