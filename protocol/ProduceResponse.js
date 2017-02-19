const _ = require('underscore');
const Response = require('./Response');

class ProduceResponse extends Response {

	read() {		
		return {
			correlationId: this.readInt32(),
			topics: this.readTopics(),
			throttleTime: this.readInt32()
		};
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
}

module.exports = ProduceResponse;