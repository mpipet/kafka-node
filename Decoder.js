const _ = require('underscore');

const printHex = function(buff, offset) {
	console.log(offset.toString() + ': ' + buff.toString('hex'));
};


class Decoder {

	constructor(buff) {
		this.buff = buff;
		this.offset = 0;
	}

	readProduceResponse() {		
		return {
			correlationId: this.readInt32(),
			topics: this.readTopics(),
			throttleTime: this.readInt32()
		};
	}

	readTopicMetadataResponse() {	
		return {
			correlationId: this.readInt32(),
			broker: this.readBrokers(),
			cluster_id: this.readString(),
			controller_id: this.readInt32(),
			topicMetadata: this.readTopicMetadata()
		};
	}


	readBrokers() {		
		const count = this.readInt32();
		const brokers = [];
		_.range(count).forEach(() => {			
			const broker = {
				nodeId: this.readInt32(),		 
				host: this.readString(),
				port: this.readInt32(),
				rack: this.readInt16()
				
			};			
			brokers.push(broker);
		});
		return brokers;
	}

	readTopicMetadata() {
		const count = this.readInt32();
		const topicsMetadata = [];
		_.range(count).forEach(() => {			
			const topicMetadata = {
				topiceErrorCode: this.readInt16(),
				topicName: this.readString(),
				isInternal: this.readIntBoolean(),
				partitionMetadata: this.readPartitionMetadata()
			};
			topicsMetadata.push(topicMetadata);

		});

		return topicsMetadata;
	}

	readPartitionMetadata() {
		const count = this.readInt32();
		const partitionsMetadata = [];
		_.range(count).forEach(() => {	
			const partitionMetadata = {
				partitionErrorCode: this.readInt16(),
				partitionId: this.readInt32(),
				leader: this.readInt32(),
				replicas: this.readInt32Array(),
				isr: this.readInt32Array()
			};
			partitionsMetadata.push(partitionMetadata);
		});
		return partitionsMetadata;
	}

	readTopics() {
		const count = this.readInt32();
		const topics = [];
		_.range(count).forEach(() => {			
			const topic = {
				topic: this.readString(),
				partitions: this.readPartitions()
			};
			topics.push(topic);
		});
		return topics;
	}

	readPartitions() {
		const count = this.readInt32();
		const partitions = [];
		_.range(count).forEach(() => {			
			const partition = {
				partition: this.readInt32(),			
				errorCode: this.readInt16(),
				offset: this.readInt64(),
				timestamp: this.readInt64()
			};
			partitions.push(partition);
		});

		return partitions;
	}

	readIntBoolean() {		
		const integer = this.buff.readIntBE(this.offset, 1);
		this.offset += 1;
		return integer;
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

module.exports = Decoder;