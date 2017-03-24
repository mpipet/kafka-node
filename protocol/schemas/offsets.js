module.exports = {
	request: {
		1: {
			replica_id: 'int32',
			topics: {
				Array: {
					topic: 'string',
					partitions: {
						Array: {
							partition: 'int32',
							timestamp: 'int64',
						}
					}
				}
			},
		}	
	},
	response: {
		1: {
			responses: {
				Array: {
					topic: 'string',
					partition_responses: {
						Array: {
							partition: 'int32',
							error_code: 'int16',
							timestamp: 'int64',
							offset: 'int64'
						}
					}
				}
			}
		}
	}

};