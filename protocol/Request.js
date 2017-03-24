const _ = require('underscore');
const crc32 = require('crc-32');

const schema = {
	Size: {
		apiKey: 'int16',
		apiVersion: 'int16',
		correlationId: 'int32',
		clientId: 'string',		
	}
};

const INT8_SIZE = 1;
const INT16_SIZE = 2;
const INT32_SIZE = 4;
const INT64_SIZE = 8;

class Request {

	constructor(requestSchema, apiKey, apiVersion, correlationId, clientId) {
		// Add request schema to request headers
		this.schema = {
			Size: _.extend(schema.Size, requestSchema)
		};

		// add request payload to header payload
		const headerPayload = {
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
		return fullPayload;
	}

	write(buffer, requestPayload, offset) {
		this.encodeToBuffer(buffer, this.schema, requestPayload, offset);
		return buffer;
	}

	computeSize(schem, payload, size) {
		Object.keys(schem).forEach((key) => {

			// Schema describes Size of a structure
			if (key === 'Size' && schem[key].constructor === Object) {
				size = this.getDataSize(payload, 'int32', size);
				size = this.computeSize(schem[key], payload, size);								
				return;
			}

			// Schema describes an Array with no array size but a buffer size
			if (key === 'Batch' && schem[key].constructor === Object) {
				size = this.getDataSize(payload, 'int32', size);
				payload.forEach((elem) => {
					size = this.computeSize(schem[key], elem, size);
				});
				return;
			}

			// Schema describes Crc32 of a structure
			if (key === 'Crc' && schem[key].constructor === Object) {
				size = this.getDataSize(payload, 'int32', size);
				size = this.computeSize(schem[key], payload, size);
				return;
			}


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

			// Schema describes Size of a structure
			if (key === 'Size' && schem[key].constructor === Object) {
				const sizeOffset = offset;
				offset += INT32_SIZE; 
				offset = this.encodeToBuffer(buffer, schem[key], payload, offset);
				const size = offset - sizeOffset - INT32_SIZE;
				this.writeInt32(buffer, size, sizeOffset);
				return;
			}

			// Schema describes Crc32 of a structure
			if (key === 'Crc' && schem[key].constructor === Object) {				
				const crcOffset = offset;
				offset += INT32_SIZE;
				offset = this.encodeToBuffer(buffer, schem[key], payload, offset);

				const toCrcBufferLength = offset - crcOffset - INT32_SIZE;
				const toCrcBuffer = Buffer.alloc(toCrcBufferLength);
				buffer.copy(toCrcBuffer, 0, crcOffset + INT32_SIZE, crcOffset + INT32_SIZE + toCrcBufferLength);

				const crc = crc32.buf(toCrcBuffer);

				this.writeInt32(buffer, crc, crcOffset);
				return;
			}

			// Schema describes an Array with no array size but a buffer size
			if (key === 'Batch' && schem[key].constructor === Object) {
				const sizeOffset = offset;
				offset += INT32_SIZE; 
				
				payload.forEach((elem) => {
					offset = this.encodeToBuffer(buffer, schem[key], elem, offset);
				});

				const size = offset - sizeOffset - INT32_SIZE;
				this.writeInt32(buffer, size, sizeOffset);
				return;
			}

			// Schema describes an Array of structure which have no array size
			if (key === 'Batch' && schem[key].constructor === String) {
				const sizeOffset = offset;
				offset += INT32_SIZE; 
						
				payload.forEach((elem) => {
					offset = this.writeData(buffer, elem, schem[key], offset);
				});

				const size = offset - sizeOffset - INT32_SIZE;
				this.writeInt32(buffer, size, sizeOffset);
				return;
			}


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
		const writeFunc = 'write'+ type.charAt(0).toUpperCase() + type.slice(1);
		offset = this[writeFunc](buffer, data, offset);

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
