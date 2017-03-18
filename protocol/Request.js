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

class Request {

	constructor(requestSchema, apiKey, payload, apiVersion, correlationId, clientId) {
		this.offset = 0;

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
		this.fullPayload = _.extend(headerPayload, payload);

		//Compute size from schema and payload
		this.size = 0;
		this.getSize();

		// Prefill the request size element
		this.fullPayload.size = this.size - 4; 

		this.buff = Buffer.alloc(this.size);
	}

	parse(schem, payload, handle) {
		Object.keys(schem).forEach((key) => {
			// Schema describes an Array of structure
			if (key === 'Array' && schem[key].constructor === Object) {
				handle(payload, 'Array');
				payload.forEach((elem) => {
					this.parse(schem[key], elem, handle);
				});
				return;
			}

			// Schema describes an Array of primitives
			if (key === 'Array' && schem[key].constructor === String) {
				handle(payload, 'Array');
				payload.forEach((elem) => {
					handle(elem, schem[key]);
				});
				return;
			}

			// Schema describes a structure
			if (schem[key].constructor === Object) {
				this.parse(schem[key], payload[key], handle);
				return;
			}
			
			// Schema describes a primitive
			handle(payload[key], schem[key]);
			
		});
	}

	//@TODO EURK get rid of thoses two methods as they are now
	//@TODO Rename for better consistency and return written buffer
	writeRequestMessage() {
		this.parse(
		 	this.schema,
		 	this.fullPayload,
		 	(data, type) => {this.writeData(data, type)}
	 	);
	}

	getSize() {
		return this.parse(
			this.schema,
			this.fullPayload,
			(data, type) => { return this.getDataSize(data, type) }
		);
	}

	//@TODO Rename thoses two methods
	getDataSize(data, type) {
		const sizeFunc = 'get'+ type.charAt(0).toUpperCase() + type.slice(1) + 'Size';
		this.size += this[sizeFunc](data); 
	}

	writeData(data, type) {
		//@TODO when schema size issue is fixed, remove this silly condition
		if (typeof data !== 'undefined') {
			const writeFunc = 'write'+ type.charAt(0).toUpperCase() + type.slice(1);
			this.offset = this[writeFunc](this.buff, data, this.offset);
		}
	}	

	// Use consts for sizes
	getInt32Size(data) {
		return 4;
	}	

	getInt64Size(data) {
		return 8;
	}

	getInt16Size(data) {
		return 2;
	}

	getArraySize(data) {
		return 4;
	}

	getBytesSize(data) {
		return 4 + data.length;
	}

	getStringSize(data) {
		return 2 + data.length;
	}

	writeInt8(buff, integer, offset) {
		return buff.writeIntBE(integer, offset, 1);
	}

	writeInt16(buff, integer, offset) {
		return buff.writeInt16BE(integer, offset);
	}

	writeInt32(buff, integer, offset) {
		return buff.writeInt32BE(integer, offset);
	}

	writeInt64(buff, integer, offset) {
		return buff.writeIntBE(integer, offset, 8);
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
