const _ = require('underscore');
const Request = require('./Request');


class MetadataRequest extends Request {

	write(buff, offset, topics) {
		offset = this.writeInt32(buff, offset, topics.length);
		topics.forEach((topic) => {
			offset = this.writeString(buff, offset, topic);
		});
		return offset;
	}	

	getSize(topics) {
		const topicsSize = _.reduce(topics, (memo, topic) => {
			return memo + (4 + topic.length);
		}, 0);
		return topics.length + topicsSize;
	}

}

module.exports = MetadataRequest;