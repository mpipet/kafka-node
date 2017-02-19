const _ = require('underscore');
const Response = require('./Response');

const printHex = function(buff, offset) {
	console.log(offset.toString() + ': ' + buff.toString('hex'));
};

class FetchResponse extends Response {	
	read() {
		return {
			correlationId: this.readInt32(),
			throttleTime: this.readInt32(),
			topics: this.readTopics(),			
		};
	}

	readTopics() {
		const count = this.readInt32();
		const topics = [];
		_.range(count).forEach(() => {			
			const topic = {
				topicName: this.readString(),
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
				erroCode: this.readInt16(),
				highwaterMarkOffset: this.readInt64(),
			};			
			partition.messageSetSize = this.readInt32();
			partition.messageSet = this.readMessageSet(partition.messageSetSize + this.offset);		 							
			partitions.push(partition);
		});
		return partitions;	
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