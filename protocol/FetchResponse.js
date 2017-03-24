const _ = require('underscore');
const Response = require('./Response');

const schema = {
	throttle_time_ms: 'int32',
	responses: {
		Array: {
			topic: 'string',
			partition_responses: {
				Array: {
					partition_header: {
						partition: 'int32',
				        error_code: 'int16',
				        high_watermark: 'int64',
					},
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
	}
}

class FetchResponse extends Response {	

	constructor(buff) {
		super(buff)
		const headerSchema = {
			correlation_id: 'int32',
		}
		this.schema = _.extend(headerSchema, schema);
	}

}

module.exports = FetchResponse;