const _ = require('underscore');
const Response = require('./Response');

const schema = {
	brokers: { 
		Array: {
			node_id: 'int32',
			host: 'string',
			port: 'int32',
			rack: 'string',		
		}
	},
	cluster_id: 'string',
	controller_id: 'int32',
	topic_metadata: {
		Array: {
			topic_error_code: 'int16',
			topic: 'string',
			is_internal: 'boolean',
			topic_metadata: {
				Array: {
					partition_error_code: 'int16',
					partition_id: 'int32',
					leader: 'int32',
					replicas: { 
						Array:'int32'
					},
					isr: {
						Array: 'int32'
					}
				}
			}
		}
	}

}; 

class MetadataResponse extends Response {

	constructor(buff) {
		super(buff)
		const headerSchema = {
			correlation_id: 'int32',
		}
		this.schema = _.extend(headerSchema, schema);
	}

	// read() {	
	// 	return {
	// 		correlationId: this.readInt32(),
	// 		broker: this.readBrokers(),
	// 		clusterId: this.readString(),
	// 		controllerId: this.readInt32(),
	// 		topicMetadata: this.readTopicMetadata()
	// 	};
	// }


	// readBrokers() {		
	// 	const count = this.readInt32();
	// 	const brokers = [];
	// 	_.range(count).forEach(() => {			
	// 		const broker = {
	// 			nodeId: this.readInt32(),		 
	// 			host: this.readString(),
	// 			port: this.readInt32(),
	// 			rack: this.readInt16()
				
	// 		};			
	// 		brokers.push(broker);
	// 	});
	// 	return brokers;
	// }

	// readTopicMetadata() {
	// 	const count = this.readInt32();
	// 	const topicsMetadata = [];
	// 	_.range(count).forEach(() => {			
	// 		const topicMetadata = {
	// 			topiceErrorCode: this.readInt16(),
	// 			topicName: this.readString(),
	// 			isInternal: this.readBoolean(),
	// 			partitionMetadata: this.readPartitionMetadata()
	// 		};
	// 		topicsMetadata.push(topicMetadata);

	// 	});

	// 	return topicsMetadata;
	// }

	// readPartitionMetadata() {
	// 	const count = this.readInt32();
	// 	const partitionsMetadata = [];
	// 	_.range(count).forEach(() => {	
	// 		const partitionMetadata = {
	// 			partitionErrorCode: this.readInt16(),
	// 			partitionId: this.readInt32(),
	// 			leader: this.readInt32(),
	// 			replicas: this.readInt32Array(),
	// 			isr: this.readInt32Array()
	// 		};
	// 		partitionsMetadata.push(partitionMetadata);
	// 	});
	// 	return partitionsMetadata;
	// }
}

module.exports = MetadataResponse;