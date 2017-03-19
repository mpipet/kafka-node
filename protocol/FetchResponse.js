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
					record_set: 'RecordSet'
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

	readRecordSet() {
		const size = this.readInt32();
		return this.readMessageSet(size + this.offset);
	}

	readMessageSet(offsetLimit) {
		
		const messageSets = [];
		while(this.offset < offsetLimit) {
			const messageSet = {
				offset: this.readInt64(),
				messageSize: this.readInt32(),
				message: this.readMessage()		 							
			};	
			messageSets.push(messageSet);			
		}

		return messageSets;
	}

	readMessage() {
		return {
			crc: this.readInt32(),
			magicByte: this.readInt8(),
			attributes: this.readInt8(),		
			timestamp: this.readInt64(),
			key: this.readBytes(),
			value: this.readBytes(),
		};
	}

}

module.exports = FetchResponse;