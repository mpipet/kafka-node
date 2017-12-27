module.exports = {
    request: {
        1: [
            ['consumer_group', 'string'],
            [
                'topics', [
                    [
                        'Array', 
                        [
                            ['topic', 'string'],
                            [
                                'partitions',
                                ['Array', 'int32']
                            ]
                        ]
                    ]
                ]
            ]
        ]
    },
    response: {
        1:  [
                [
                    'responses',
                    [
                        'Array',
                        [
                            ['topic', 'string'],
                            [
                                'partitions',
                                [
                                    'Array',
                                    [
                                        ['partition', 'int32'],
                                        ['offset', 'int64'],
                                        ['metadata', 'string'],
                                        ['error_code', 'int16'],
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
        ]
    }
};