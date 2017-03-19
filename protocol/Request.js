const _ = require('underscore');

const schema = {
	size: 'int32',
	apiKey: 'int16',
	apiVersion: 'int16',
	correlationId: 'int32',
	clientId: 'string',
};

//@TODO find a solution to precompute size of schema sub elements
//@TODO Use the two following schema declaration instead
const RequestOrResponse = {
	size: 'int32'
}

const RequestHeader = {
	apiKey: 'int16',
	apiVersion: 'int16',
	correlationId: 'int32',
	clientId: 'string',
}

const INT8_SIZE = 1;
const INT16_SIZE = 2;
const INT32_SIZE = 4;
const INT64_SIZE = 8;

class Request {

	constructor(requestSchema, apiKey, apiVersion, correlationId, clientId) {
		// Add request schema to request headers
		this.schema = _.extend(schema, requestSchema);

		// add request payload to header payload
		const headerPayload = {
			size: 0,
			apiKey: apiKey,
			apiVersion: apiVersion,
			correlationId: correlationId,
			clientId: clientId,			
		};
		this.headerPayload = headerPayload;
	}

	getSize(messagePayload) {
		let size = 0;
		const fullPayload = _.extend(this.headerPayload, messagePayload);

		size = this.computeSize(this.schema, fullPayload, size);
		return size;
	}

	getRequestPayload(size, messagePayload) {
		const fullPayload = _.extend(this.headerPayload, messagePayload);

		//Feed request ack size with the right value
		fullPayload.size = size - INT32_SIZE;
		return fullPayload;
	}

	write(buffer, requestPayload, offset) {
		this.encodeToBuffer(buffer, this.schema, requestPayload, offset);
		return buffer;
	}

	computeSize(schem, payload, size) {
		Object.keys(schem).forEach((key) => {
			// Schema describes an Array of structure
			if (key === 'Array' && schem[key].constructor === Object) {
				size = this.getDataSize(payload, 'Array', size);
				payload.forEach((elem) => {
					size = this.computeSize(schem[key], elem, size);
				});
				return;
			}

			// Schema describes an Array of primitives
			if (key === 'Array' && schem[key].constructor === String) {
				size = this.getDataSize(payload, 'Array', size);
				payload.forEach((elem) => {
					size = this.getDataSize(elem, schem[key], size);
				});
				return;
			}

			// Schema describes a structure
			if (schem[key].constructor === Object) {
				size = this.computeSize(schem[key], payload[key], size);
				return;
			}
			
			// Schema describes a primitive
			size = this.getDataSize(payload[key], schem[key], size);
			
		});
		return size;
	}

	encodeToBuffer(buffer, schem, payload, offset) {
		Object.keys(schem).forEach((key) => {
			// Schema describes an Array of structure
			if (key === 'Array' && schem[key].constructor === Object) {
				offset = this.writeData(buffer, payload, 'Array', offset);
				payload.forEach((elem) => {
					offset = this.encodeToBuffer(buffer, schem[key], elem, offset);
				});
				return;
			}

			// Schema describes an Array of primitives
			if (key === 'Array' && schem[key].constructor === String) {
				offset = this.writeData(buffer, payload, 'Array', offset);
				payload.forEach((elem) => {
					offset = this.writeData(buffer, elem, schem[key], offset);
				});
				return;
			}

			// Schema describes a structure
			if (schem[key].constructor === Object) {
				offset = this.encodeToBuffer(buffer, schem[key], payload[key], offset);
				return;
			}
			
			// Schema describes a primitive
			offset = this.writeData(buffer, payload[key], schem[key], offset);
			
		});
		return offset;
	}

	//@TODO Rename thoses two methods
	getDataSize(data, type, size) {
		const sizeFunc = 'get'+ type.charAt(0).toUpperCase() + type.slice(1) + 'Size';
		size += this[sizeFunc](data);
		return size;
	}

	writeData(buffer, data, type, offset) {
		//@TODO when schema size issue is fixed, remove this silly condition
		if (typeof data !== 'undefined') {
			const writeFunc = 'write'+ type.charAt(0).toUpperCase() + type.slice(1);
			offset = this[writeFunc](buffer, data, offset);
		}

		return offset;
	}	

	/*
	 * primitives size getters
	 */
	getInt8Size(data) {
		return INT8_SIZE;
	}

	getInt16Size(data) {
		return INT16_SIZE;
	}

	getInt32Size(data) {
		return INT32_SIZE;
	}	

	getInt64Size(data) {
		return INT64_SIZE;
	}

	getArraySize(data) {
		return INT32_SIZE;
	}

	getBytesSize(data) {
		return INT32_SIZE + data.length;
	}

	getStringSize(data) {
		return INT16_SIZE + data.length;
	}

	/*
	 * primitives writters
	 */
	writeInt8(buff, integer, offset) {
		return buff.writeIntBE(integer, offset, INT8_SIZE);
	}

	writeInt16(buff, integer, offset) {
		return buff.writeInt16BE(integer, offset);
	}

	writeInt32(buff, integer, offset) {
		return buff.writeInt32BE(integer, offset);
	}

	writeInt64(buff, integer, offset) {
		return buff.writeIntBE(integer, offset, INT64_SIZE);
	}

	writeArray(buff, array, offset) {
		return buff.writeInt32BE(array.length, offset);
	}

	writeString(buff, string, offset) {
		offset = this.writeInt16(buff, string.length, offset);
		offset += buff.write(string, offset, string.length);
		return offset;
	}

	writeBytes(buff, string, offset) {
		offset = this.writeInt32(buff, string.length, offset);
		offset += buff.write(string, offset, string.length);
		return offset;
	}

}

module.exports = Request;
