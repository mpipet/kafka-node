const _ = require('underscore');

class Response {

	constructor(buff) {
		this.buff = buff;
		this.offset = 0;
	}	

	read() {
		// console.log(this.schema)
		return this.decodeBuffer(this.schema, {});
	}

	decodeBuffer(schem, data) {
		Object.keys(schem).forEach((key) => {
			// console.log(key)
			if (key === 'Array' && schem[key].constructor === Object) {
				const size = this.decodeData('Array');
				// console.log(size)
				const structArray = [];
				_.range(size).forEach((elem) => {
					structArray.push(this.decodeBuffer(schem[key], {}));
				});
				data = structArray;
				return;
			}

			// // Schema describes an Array of primitives
			if (key === 'Array' && schem[key].constructor === String) {
				const size = this.decodeData('Array');
				const primitiveArray = [];
				_.range(size).forEach((elem) => {
					primitiveArray.push(this.decodeData(schem[key]));
				});
				data = primitiveArray;
				return;
			}

			// Schema describes a structure
			if (schem[key].constructor === Object) {
				data[key] = this.decodeBuffer(schem[key], {});
				return;
			}
			
			// Schema describes a primitive
			data[key] = this.decodeData(schem[key]);
			
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
		const integer = this.buff.readIntBE(this.offset, 8);
		this.offset += 8;
		return integer;
	}

	readArray() {
		const size = this.buff.readIntBE(this.offset, 4);
		this.offset += 4;
		return size;
	}

	readString() {
		const size = this.buff.readIntBE(this.offset, 2);
		this.offset += 2;

		let string = '';
		if (size > 0) {
			string = this.buff.toString('utf-8', this.offset, this.offset + size);
			this.offset += size;			
		}
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