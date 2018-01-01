module.exports = {
  request: {
    0: [
      [
        'group_ids',
        [
          'Array', 'string'
        ]
      ]            
    ],
    1: [
      [
        'group_ids',
        [
          'Array', 'string'
        ]
      ]            
    ]
  },
  response: {
    0: [
      [
        'groups',
        [
          'Array',
          [
            ['error_code', 'int16'],
            ['group_id', 'string'],
            ['state', 'string'],
            ['protocol_type', 'string'],
            ['protocol', 'string'],
            [
              'members',
              [
                'Array',
                [
                  ['member_id', 'string'],
                  ['client_id', 'string'],
                  ['client_host', 'string'],
                  ['member_metadata', 'string'],
                  ['member_assignment', 'string']
                ]
              ]
            ]
          ]
        ]
      ]

    ],
     1: [
      ['throttle_time_ms', 'int32'],
      [
        'groups',
        [
          'Array',
          [
            ['error_code', 'int16'],
            ['group_id', 'string'],
            ['state', 'string'],
            ['protocol_type', 'string'],
            ['protocol', 'string'],
            [
              'members',
              [
                'Array',
                [
                  ['member_id', 'string'],
                  ['client_id', 'string'],
                  ['client_host', 'string'],
                  ['member_metadata', 'bytes'],
                  ['member_assignment', 'bytes']
                ]
              ]
            ]
          ]
        ]
      ]

    ]
  }

};