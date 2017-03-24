module.exports = {
	request: {
		0: {
			controller_id: 'int32',
			controller_epoch: 'int32',

			partition_states: {
				Array: {
					topic: 'string',
					partition: 'int32',
					controller_epoch: 'int32',
					leader: 'int32',
					leader_epoch: 'int32',
					isr: {
						Array: 'int32'
					},
					zk_version: 'int32',
					replicas: {
						Array: 'int32'
					}
				}
			},
			live_leaders: {
				Array: {
					id: 'int32',
					host: 'string',
					port: 'int32'
				}
			}
		}
	},
	response: {
		0: {
			error_code: 'int16',
			partitions: {
				Array: {
					topic: 'string',
					partition: 'int32',
					error_code: 'int16',
				}
			}
		}
	}
	
};