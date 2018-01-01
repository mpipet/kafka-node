module.exports = {
  request: {
    0: [],
    1: []
  },
  response: {
    0: [
      ['error_code', 'int16'],
      [
       'api_versions', 
        [
          'Array',
          [
            ['api_key', 'int16'],
            ['min_version', 'int16'],
            ['max_version', 'int16']          
          ]
        ]
      ]
    ],
    1: [
      ['error_code', 'int16'],
      [
        'api_versions', 
        [
          'Array',
          [
            ['api_key', 'int16'],
            ['min_version', 'int16'],
            ['max_version', 'int16']          
          ]
        ]
      ],
      ['throttle_time_ms', 'int32']
    ]
  }

};