module.exports = {
  request: {
    0: [
      ['group_id', 'string']
    ],
    1: [
      ['group_id', 'string'],
      ['group_type', 'int8'],
    ]
  },
  response: {
    0: [
      ['error_code', 'int16'],
      ['node_id', 'int32'],
      ['host', 'string'],
      ['port', 'int32']
    ],
    1: [
      ['throttle_time_ms', '32'],
      ['error_code', 'int16'],
      ['error_message', 'string'],
      ['node_id', 'int32'],
      ['host', 'string'],
      ['port', 'int32']
    ]
  }

};