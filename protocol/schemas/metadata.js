const metadataSchema = {
  request: {
    0: [
      [
        'topics',
        ['Array', 'string']
      ]
    ],
    4: [
      [
        'topics',
        ['Array', 'string'],
      ],
      ['allow_auto_topic_creation', 'boolean']
    ]
  },
  response: {
    0: [
      [
        'brokers',
        [
          'Array',
          [
            ['node_id', 'int32'],
            ['host', 'string'],
            ['port', 'int32'],
          ]
        ]
      ],
      [
        'topic_metadata',
        [
          'Array',
          [
            ['error_code', 'int16'],
            ['topic', 'string'],
            [
              'partition_metadata',
              [
                'Array',
                [
                  ['error_code', 'int16'],
                  ['partition', 'int32'],
                  ['leader', 'int32'],
                  [
                    'replicas', [
                      'Array', 'int32'
                    ]
                  ],
                  [
                    'isr', [
                      'Array', 'int32'
                    ]
                  ]
                ] 
              ] 
            ]
          ]
        ]
      ]
    ],
    1: [
      [
        'brokers',
        [
          'Array',
          [
            ['node_id', 'int32'],
            ['host', 'string'],
            ['port', 'int32'],
            ['rack', 'nullable_string'],
          ]
        ]
      ],
      ['controller_id', 'int32'],
      [
        'topic_metadata',
        [
          'Array',
          [
            ['error_code', 'int16'],
            ['topic', 'string'],
            ['is_internal', 'boolean'],
            [
              'partition_metadata',
              [
                'Array',
                [
                  ['error_code', 'int16'],
                  ['partition', 'int32'],
                  ['leader', 'int32'],
                  [
                    'replicas', [
                      'Array', 'int32'
                    ]
                  ],
                  [
                    'isr', [
                      'Array', 'int32'
                    ]
                  ]
                ] 
              ] 
            ]
          ]
        ]
      ]
    ],
    2: [
      [
        'brokers',
        [
          'Array',
          [
            ['node_id', 'int32'],
            ['host', 'string'],
            ['port', 'int32'],
            ['rack', 'nullable_string'],
          ]
        ]
      ],
      ['cluster_id', 'nullable_string'],
      ['controller_id', 'int32'],
      [
        'topic_metadata',
        [
          'Array',
          [
            ['error_code', 'int16'],
            ['topic', 'string'],
            ['is_internal', 'boolean'],
            [
              'partition_metadata',
              [
                'Array',
                [
                  ['error_code', 'int16'],
                  ['partition', 'int32'],
                  ['leader', 'int32'],
                  [
                    'replicas', [
                      'Array', 'int32'
                    ]
                  ],
                  [
                    'isr', [
                      'Array', 'int32'
                    ]
                  ]
                ] 
              ] 
            ]
          ]
        ]
      ]
    ],
    3: [
      ['throttle_time_ms', 'int32'],
      [
        'brokers',
        [
          'Array',
          [
            ['node_id', 'int32'],
            ['host', 'string'],
            ['port', 'int32'],
            ['rack', 'nullable_string'],
          ]
        ]
      ],
      ['cluster_id', 'nullable_string'],
      ['controller_id', 'int32'],
      [
        'topic_metadata',
        [
          'Array',
          [
            ['error_code', 'int16'],
            ['topic', 'string'],
            ['is_internal', 'boolean'],
            [
              'partition_metadata',
              [
                'Array',
                [
                  ['error_code', 'int16'],
                  ['partition', 'int32'],
                  ['leader', 'int32'],
                  [
                    'replicas', [
                      'Array', 'int32'
                    ]
                  ],
                  [
                    'isr', [
                      'Array', 'int32'
                    ]
                  ]
                ] 
              ] 
            ]
          ]
        ]
      ]
    ],
    5: [
      ['throttle_time_ms', 'int32'],
      [
        'brokers',
        [
          'Array',
          [
            ['node_id', 'int32'],
            ['host', 'string'],
            ['port', 'int32'],
            ['rack', 'nullable_string'],
          ]
        ]
      ],
      ['cluster_id', 'nullable_string'],
      ['controller_id', 'int32'],
      [
        'topic_metadata',
        [
          'Array',
          [
            ['error_code', 'int16'],
            ['topic', 'string'],
            ['is_internal', 'boolean'],
            [
              'partition_metadata',
              [
                'Array',
                [
                  ['error_code', 'int16'],
                  ['partition', 'int32'],
                  ['leader', 'int32'],
                  [
                    'replicas', [
                      'Array', 'int32'
                    ]
                  ],
                  [
                    'isr', [
                      'Array', 'int32'
                    ]
                  ],
                  ['offline_replicas', 'int32']
                ] 
              ] 
            ]
          ]
        ]
      ]
    ]         
  }
  
};

metadataSchema.request[1] = metadataSchema.request[0];
metadataSchema.request[2] = metadataSchema.request[0];
metadataSchema.request[3] = metadataSchema.request[0];

metadataSchema.request[5] = metadataSchema.request[4];

metadataSchema.response[4] = metadataSchema.response[3];



module.exports = metadataSchema;