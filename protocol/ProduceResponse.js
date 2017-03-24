const _ = require('underscore');
const Response = require('./Response');

const schema = {
	responses: {
		Array: {
			topic: 'string',
			partition_responses: {
				Array: {					
					partition: 'int32',
					error_code: 'int16',
					base_offset: 'int64',
					log_append_time: 'int64',
				}
			}
		}
	},
	throttle_time_ms: 'int32'
}

class ProduceResponse extends Response {

	constructor(buff) {
		super(buff)
		const headerSchema = {
			correlation_id: 'int32',
		}
		this.schema = _.extend(headerSchema, schema);
	}
}

module.exports = ProduceResponse;