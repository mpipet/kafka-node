const _ = require('lodash');
const crc32 = require('crc-32');
const schemas = require('./schemas');
const cst = require('./constants');

const INT8_SIZE = 1;
const INT16_SIZE = 2;
const INT32_SIZE = 4;
const INT64_SIZE = 8;

class Request {

  constructor(apiKey, apiVersion, clientId) {
    const schema = [
      ['api_key', 'int16'],
      ['api_version', 'int16'],
      ['correlation_id', 'int32'],
      ['clientId', 'nullable_string']
    ];
    // Add request schema to request headers
    this.schema = schema;

    if (typeof schemas[apiKey] === 'undefined') {
      throw new Error('Unsupported api key: ' + apiKey);
    }

    if (typeof schemas[apiKey].request[apiVersion] === 'undefined') {
      throw new Error('Unsupported api version: ' + apiVersion);
    }

    this.schema = _.concat(schema, schemas[apiKey].request[apiVersion]);

    // add request payload to header payload
    const headerPayload = {
      api_key: apiKey,
      api_version: apiVersion,
      correlation_id: 0,
      clientId: null,         
    };
    this.headerPayload = headerPayload;
  }

  getSize(payload) {
    let size = 0;

    size = this.computeSize(this.schema, payload, size);
    return size;
  }

  getRequestPayload(messagePayload, correlationId) {
    this.headerPayload.correlation_id = correlationId;
    const fullPayload = _.extend(this.headerPayload, messagePayload);
    return fullPayload;
  }

  write(buffer, requestPayload, offset) {
    this.encodeToBuffer(buffer, this.schema, requestPayload, offset);
    return buffer;
  }

  computeSize(schema, payload, size) {
    schema.forEach((schem) => {
      const key = schem[0];
      const value = schem[1];

      if (key === 'Size') {
        size = this.getDataSize(payload, 'int32', size);
        size = this.computeSize(value, payload, size);
        return;                             
      }

      // Schema describes an Array with no array size but a buffer size
      if (key === 'Batch') {
        size = this.getDataSize(payload, 'int32', size);
        payload[key].forEach((elem) => {
            size = this.computeSize(value, elem, size);
        });
        return;
      }

      // Schema describes Crc32 of a structure
      if (key === 'Crc') {
        size = this.getDataSize(payload, 'int32', size);
        size = this.computeSize(value, payload, size);
        return;
      }

      // Schema describes an Array of primitives
      if (value[0] === 'Array' && typeof value[1] === 'string') {
        size = this.getDataSize(payload[key], 'Array', size);
        if (payload[key] === null) {
          return
        }

        payload[key].forEach((elem) => {
          size = this.getDataSize(elem, value[1], size);
        });    
        return;
      }

      // Schema describes an Array of structure
      if (value[0] === 'Array' && Array.isArray(value[1])) {
        size = this.getDataSize(payload, 'Array', size);
        if (payload[key] === null) {
          return
        }
        payload[key].forEach((elem) => {
          size = this.computeSize(value[1], elem, size);
        });
        return;
      }

      // Schema describes a structure
      if (Array.isArray(value[0])) {
        size = this.computeSize(value, payload[key], size);
        return;
      }

      // Schema describes a primitive
      if (typeof value === 'undefined') {
        throw new Error('The value of ' + key + ' is not available in payload');
      }

      size = this.getDataSize(payload[key], value, size);

    }); 

    return size;
  }

  encodeToBuffer(buffer, schema, payload, offset) {
    schema.forEach((schem) => {    
      const key = schem[0];
      const value = schem[1];

      // Schema describes Size of a structure
      if (key === 'Size') {
        const sizeOffset = offset;
        offset += INT32_SIZE; 
        offset = this.encodeToBuffer(buffer, value, payload, offset);
        const size = offset - sizeOffset - INT32_SIZE;
        this.writeInt32(buffer, size, sizeOffset);
        return;
      }

      // Schema describes Crc32 of a structure
      if (key === 'Crc') {               
        const crcOffset = offset;
        offset += INT32_SIZE;
        offset = this.encodeToBuffer(buffer, value, payload, offset);

        const toCrcBufferLength = offset - crcOffset - INT32_SIZE;
        const toCrcBuffer = Buffer.alloc(toCrcBufferLength);
        buffer.copy(toCrcBuffer, 0, crcOffset + INT32_SIZE, crcOffset + INT32_SIZE + toCrcBufferLength);

        const crc = crc32.buf(toCrcBuffer);

        this.writeInt32(buffer, crc, crcOffset);
        return;
      }

      // Schema describes an Array with no array size but a buffer size
      if (key === 'Batch') {
        const sizeOffset = offset;
        offset += INT32_SIZE; 
        
        payload.forEach((elem) => {
          offset = this.encodeToBuffer(buffer, value, elem, offset);
        });

        const size = offset - sizeOffset - INT32_SIZE;
        this.writeInt32(buffer, size, sizeOffset);
        return;
      }

      // Schema describes an Array of structure which have no array size
      if (key === 'Batch' && typeof value[1] === 'string') {
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
      if (value[0] === 'Array' && Array.isArray(value[1])) {
        offset = this.writeData(buffer, payload[key], 'Array', offset);
        if (payload[key] === null) {
          return
        }
        payload[key].forEach((elem) => {
            offset = this.encodeToBuffer(buffer, value[1], elem, offset);
        });
        return;
      }

      // Schema describes an Array of primitives
      if (value[0] === 'Array' && typeof value[1] === 'string') {
        offset = this.writeData(buffer, payload[key], 'Array', offset);
        if (payload[key] === null) {
          return
        }
        payload[key].forEach((elem) => {
          offset = this.writeData(buffer, elem, value[1], offset);
        });
        return;
      }

      // Schema describes a structure
      if (Array.isArray(value[0])) {
        offset = this.encodeToBuffer(buffer, value, payload[key], offset);
        return;
      }
      
      // Schema describes a primitive
      if (typeof payload[key] === 'undefined') {
         throw new Error('The value of ' + key + ' is not available in payload');
      }
      offset = this.writeData(buffer, payload[key], value, offset);
        
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

  getBooleanSize(data) {
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
    if (data === null) {
      throw new Error('Unsupported null string');
    }

    return INT16_SIZE + data.length;
  }

  getNullable_stringSize(data) {    
    let size = 0;
    if (data !== null) {
      size = data.length;
    }

    return INT16_SIZE + size;
  }

  /*
   * primitives writters
   */
  writeBoolean(buff, boolean, offset) {
    return buff.writeIntBE(boolean, offset, INT8_SIZE);
  }

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
    let length = -1;
    if (array !== null){
      length = array.length;
    }
    return buff.writeInt32BE(length, offset);
  }

  writeString(buff, string, offset) {
    if (string === null) {
      throw new Error('Unsupported null string');
    }

    offset = this.writeInt16(buff, string.length, offset);
    offset += buff.write(string, offset, string.length);
    return offset;
  }

  writeNullable_string(buff, string, offset) {
    let size = -1;

    if (string !== null) {
      size = string.length;
    }

    offset = this.writeInt16(buff, size, offset);
    if (string !== null) {
      offset += buff.write(string, offset, size);
    }
    return offset;
  }

  writeBytes(buff, string, offset) {
    offset = this.writeInt32(buff, string.length, offset);
    offset += buff.write(string, offset, string.length);
    return offset;
  }

}

Request.createBuffer = function(apiKey, apiVersion, correlationId, payload) {
  const request = new Request(apiKey, apiVersion, cst.CLIENT_ID);
  const requestPayload = request.getRequestPayload(payload, correlationId);

  const size = request.getSize(requestPayload);
  const buffer = Buffer.alloc(size);
  request.write(buffer, requestPayload, 0);
  return buffer;
}

Request.getbestApiVersion = function(apiKey) {
  if (typeof schemas[apiKey] === 'undefined') {
    throw new Error('Unsupported api key: ' + apiKey);
  }

  return _.map(
    Object.keys(schemas[apiKey].request),
    (version) => parseInt(version, 10)
  );
}

module.exports = Request;

