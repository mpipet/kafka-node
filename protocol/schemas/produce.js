module.exports = {
	request: {
		2: {
			acks: 'int16',
			timeout: 'int32',
			topic_data: {
				Array: {
					topic: 'string',
					data: {
						Array: {
							partition: 'int32',
							record_set: {
								Batch: {
									offset: 'int64',
									Size: {
										Crc: {
											magic_byte: 'int8',
											attributes: 'int8',
											timestamp: 'int64',
											key: 'bytes',
											value: 'bytes'
										}
									}
								}
							}
						}
					}
				}
			}
		}
	},
	response: {
		2: {
			responses: {
				Array: {
					topic: 'string',
					partition_responses: {
						Array: {					
							partition: 'int32',
							error_code: 'int16',
							base_offset: 'int64',
							log_append_time: 'int64',
						}
					}
				}
			},
			throttle_time_ms: 'int32'
		}
	}
	
};