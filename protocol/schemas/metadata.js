module.exports = {
	request: {
		2: {
			topics: {
				Array: 'string'
			}
		}
	},
	response: {
		2: {
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
		}
	}
	
};