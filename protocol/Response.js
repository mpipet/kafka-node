const _ = require('underscore');

class Response {

	constructor(buff) {
		this.buff = buff;
		this.offset = 0;
	}	

	readIntBoolean() {		
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
		const integer = this.buff.readIntBE(this.offset, 8);
		this.offset += 8;
		return integer;
	}

	readInt32Array() {
		const size = this.buff.readIntBE(this.offset, 4);
		this.offset += 4;
		const array = [];
		_.range(size).forEach((index) => {
			array.push(this.buff.readIntBE(this.offset, 4));
			this.offset += 4;
		});

		return array;
	}

	readString() {
		const size = this.buff.readIntBE(this.offset, 2);
		this.offset += 2;
		const string = this.buff.toString('utf-8', this.offset, this.offset + size);
		this.offset += size;
		return string;
	}

	readBytes() {
		const size = this.buff.readIntBE(this.offset, 4);
		this.offset += 4;
		const string = this.buff.toString('utf-8', this.offset, this.offset + size);
		this.offset += size;
		return string;
	}
}

module.exports = Response;