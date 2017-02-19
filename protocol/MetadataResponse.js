const _ = require('underscore');
const Response = require('./Response');

class MetadataResponse extends Response {

	read() {	
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
}

module.exports = MetadataResponse;