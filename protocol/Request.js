const _ = require('underscore');

class Request {

	writeRequestOrResponse(buff, offset, requestMessageSize) {
		return this.writeInt32(buff, offset, requestMessageSize);
	}

	writeRequestMessage(buff, offset, apiKey, apiVersion, correlationId, clientId) {
		offset = this.writeInt16(buff, offset, apiKey);
		offset = this.writeInt16(buff, offset, apiVersion);
		offset = this.writeInt32(buff, offset, correlationId);
		return  this.writeString(buff, offset, clientId);
	}	

	getRequestOrResponseSize(messageSize) {
		// messageSize as int32 + messageSize
		return 4 + messageSize;
	} 

	getRequestMessageSize(clientId, requestMessageSize) {
		// apiKey as int16 + apiversion as int16 + correlationid as int32 + clientId as string + requestMessageSize
		return 2 + 2 + 4 + (2 + clientId.length) + requestMessageSize;
	}	

	writeInt8(buff, offset, integer) {
		return buff.writeIntBE(integer, offset, 1);
	}

	writeInt16(buff, offset, integer) {
		return buff.writeInt16BE(integer, offset);
	}

	writeInt32(buff, offset, integer) {
		return buff.writeInt32BE(integer, offset);
	}

	writeInt64(buff, offset, integer) {
		return buff.writeIntBE(integer, offset, 8);
	}

	writeString(buff, offset, string) {
		offset = this.writeInt16(buff, offset, string.length);
		offset += buff.write(string, offset, string.length);
		return offset;
	}

	writeBytes(buff, offset, string) {
		offset = this.writeInt32(buff, offset, string.length);
		offset += buff.write(string, offset, string.length);
		return offset;
	}

}

module.exports = Request;
