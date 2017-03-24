module.exports = {
	request: {
		2: {
			replica_id: 'int32',
			max_wait_time: 'int32',
			min_bytes: 'int32',
			topics: {
				Array: {
					topic: 'string',
					partitions: {
						Array: {
							partition: 'int32',
							fetch_offset: 'int64',
							max_bytes: 'int32',
						}
					}
				}
			}
		}	
	},
	response: {
		2: {
			throttle_time_ms: 'int32',
			responses: {
				Array: {
					topic: 'string',
					partition_responses: {
						Array: {
							partition_header: {
								partition: 'int32',
						        error_code: 'int16',
						        high_watermark: 'int64',
							},
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
	}

};