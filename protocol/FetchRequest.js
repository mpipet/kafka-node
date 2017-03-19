const _ = require('underscore');
const Request = require('./Request');

const cst = require('./constants');

const schema = {
	replica_id: 'int32',
	max_wait_time: 'int32',
	min_bytes: 'int32',
	topics: {
		Array: {
			topic: 'string',
			partitions: {
				Array: {
					partition: 'int32',
					fetch_offset: 'int64',
					max_bytes: 'int32',
				}
			}
		}
	}
};

class FetchRequest extends Request {

	constructor(apiVersion, correlationId, clientId) {
		super(schema, cst.FETCH_REQUEST, apiVersion, correlationId, clientId);
	}
}

module.exports = FetchRequest;