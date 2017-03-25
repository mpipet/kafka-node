module.exports = {
	request: {
		0: {
			group_id: 'string',
		}	
	},
	response: {
		0: {
			error_code: 'int16',
			coordinator: {
				node_id: 'int32',
				host: 'string',
				port: 'int32',
			}
		}
	}

};