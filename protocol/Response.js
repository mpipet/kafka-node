const _ = require('lodash');
const Int64 = require('node-int64')

const schemas = require('./schemas');

class Response {

  constructor(buff, apiKey, apiVersion) {
    this.buff = buff;
    this.offset = 0;

    if (typeof schemas[apiKey] === 'undefined') {
      throw new Error('Unsupported api key: ' + apiKey);
    }

    if (typeof schemas[apiKey].response[apiVersion] === 'undefined') {
      throw new Error('Unsupported api version: ' + apiVersion);
    }

    this.schema = schemas[apiKey].response[apiVersion]; 
  }   

  read() {
    return this.decodeBuffer(this.schema, {});
  }

  decodeBuffer(schem, data) {
    schem.forEach((schem) => {
      const key = schem[0];
      const value = schem[1];

      // Schema describes an Array of primitives
      if (value[0] === 'Array' && typeof value[1] === 'string') {
        const size = this.decodeData('Array');
        const primitiveArray = [];
        _.range(size).forEach((elem) => {
          primitiveArray.push(this.decodeData(value[1]));
        });
        data[key] = primitiveArray;
        return;
      }

      if (value[0] === 'Array' && Array.isArray(value)) {
        const size = this.decodeData('Array');
        const structArray = [];
        _.range(size).forEach((elem) => {
          structArray.push(this.decodeBuffer(value[1], {}));
        });
        data[key] = structArray;
        return;
      }
      
      // Schema describes Size of a structure
      if (key === 'Size') {
        this.decodeData('int32');
        data = _.extend(data, this.decodeBuffer(value, {}));
        return;
      }

      // Schema describes an Array with no array size but a buffer size
      if (key === 'Batch') {
        const size = this.decodeData('int32');
        const batchOffsetStart = this.offset;
        const structArray = [];
        while(this.offset < batchOffsetStart + size) {
          structArray.push(this.decodeBuffer(value, {}));
        }
        data[key] = structArray;
        return;
      }

      // Schema describes Crc32 of a structure
      if (key === 'Crc') {
        this.decodeData('int32');
        data = this.decodeBuffer(value, {});
        return;
      }

      // Schema describes a structure
      if (Array.isArray(value)) {
        data[key] = this.decodeBuffer(value[1], {});
        return;
      }
      
      // Schema describes a primitive
      data[key] = this.decodeData(value);
    });

    return data;
  }

  decodeData(type) {
    const decodeFunc = 'read'+ type.charAt(0).toUpperCase() + type.slice(1);
    return this[decodeFunc]();
  }

  readBoolean() {     
    const integer = this.buff.readIntBE(this.offset, 1);
    this.offset += 1;
    return Boolean(integer);
  }

  readInt8() {        
    const integer = this.buff.readIntBE(this.offset, 1);
    this.offset += 1;
    return integer;
  }

  readInt16() {
    const integer = this.buff.readIntBE(this.offset, 2);
    this.offset += 2;
    return integer;
  }

  readInt32() {
    const integer = this.buff.readIntBE(this.offset, 4);
    this.offset += 4;
    return integer;
  }

  readInt64() {
    const int64Buff = this.buff.slice(this.offset, this.offset + 8);
    const x = new Int64(int64Buff);
    const integer = parseInt(x.toString(), 10);
    this.offset += 8;       
    return integer;
  }

  readArray() {
    const size = this.buff.readIntBE(this.offset, 4);
    this.offset += 4;
    return size;
  }

  readNullable_string() {
    const size = this.buff.readIntBE(this.offset, 2);
    this.offset += 2;

    let string = null;
    if (size > 0) {
      string = this.buff.toString('utf-8', this.offset, this.offset + size);
      this.offset += size;            
    }
    return string;
  }

  readString() {
    const size = this.buff.readIntBE(this.offset, 2);
    this.offset += 2;

    if (size < 0) {
      throw new Error('Invalid string size: ' + size);
    }

    let string = '';
    if (size >= 0) {
      string = this.buff.toString('utf-8', this.offset, this.offset + size);
      this.offset += size;            
    }
    return string;
  }

  readBytes() {
    const size = this.buff.readIntBE(this.offset, 4);
    this.offset += 4;

    let string = null;
    if (size > 0) {
      string = this.buff.toString('utf-8', this.offset, this.offset + size);
      this.offset += size;            
    }
    return string;
  }
}

module.exports = Response;