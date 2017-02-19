const _ = require('underscore');
const Request = require('./Request');


class FetchRequest extends Request {

	write(buff, offset, replicaId, maxWaitTime, minBytes, topics) {
		offset = this.writeInt32(buff, offset, replicaId);
		offset = this.writeInt32(buff, offset, maxWaitTime);
		offset = this.writeInt32(buff, offset, minBytes);
		// offset = this.writeInt32(buff, offset, maxBytes);
		offset = this.writeTopics(buff, offset, topics);
	}

	writeTopics(buff, offset, topics) {
		offset = this.writeInt32(buff, offset, topics.length);
		topics.forEach((topic) => {
			offset = this.writeString(buff, offset, topic.topic);
			offset = this.writePartitions(buff, offset, topic.partitions);
		});
	}

	writePartitions(buff, offset, partitions) {
		offset = this.writeInt32(buff, offset, partitions.length);
		partitions.forEach((partition) => {
			offset = this.writeInt32(buff, offset, partition.partition);
			offset = this.writeInt64(buff, offset, partition.fetchOffset);
			offset = this.writeInt32(buff, offset, partition.maxBytes);
		});		
	}

	getSize(topics) {
		const topicsSize =  _.reduce(topics, (memo, topic) => {

			const partitionsSize = _.reduce(topics, (memo, topic) => {
				return this.getPartitionSize();
			}, 0);
			// topicName as string + partitionsArray size as int32 + partitionSize
			return memo + (4 + topic.topic.length) + 4 + partitionsSize;
		}, 0);

		// replicaid as int32 + maxWaitTime as int32 + mintBytes as int32 + topicsArray size as int32 + topicSize
		return 4 + 4 + 4 + 4  + topicsSize;
	}

	getPartitionSize() {
		// partition as int32 + fetchOffset as int64 + maxBytes as int32
		return 4 + 8 + 4;
	}
}

module.exports = FetchRequest;