module.exports = {
	request: {
		1: {
			group_id: 'string',
			session_timeout: 'int32',
			rebalance_timeout: 'int32',
			member_id: 'string',
			protocol_type: 'string',
			group_protocols: {
				Array: {
					protocol_name: 'string',
					protocol_metadata: 'bytes'
				}
			}
		}	
	},
	response: {
		1: {
			error_code: 'int16',
			generation_id: 'int32',
			group_protocol: 'string',
			leader_id: 'string',
			member_id: 'string',
			members: {
				Array: {
					member_id: 'string',
					member_metadata: 'bytes'
				}
			}
		}
	}

};