const _ = require('lodash');
const async = require('async');

const Client = require('./Client');
const Cluster = require('./Cluster');

const cst = require('./protocol/constants');
const Response = require('./protocol/Response');
const Request = require('./protocol/Request');

const client = new Client('192.168.50.10:9092');
client.getMetadatas(null, (metadatas) => {

    const cluster = new Cluster(metadatas);

    const topicsPartitions = {};
    metadatas.topic_metadata.forEach((topic_meta) => {
        topicsPartitions[topic_meta.topic] = _.map(topic_meta.topic_metadata, 'partition'); 
    });

    const calls = [
        (done) => cluster.getCommittedOffsets(
            'live-deliveries',
            topicsPartitions,
            (data) => done(null, data)),
        (done) => cluster.getOffsetsList(
            topicsPartitions,
            (data) => done(null, data))        
    ];

    async.parallel(calls, (err, results) => {

        const committedOffsets = {};
        const offsetsList = {};

        _.each(results[0].responses, (response) => {            
            committedOffsets[response.topic] = {};
            _.each(response.partitions, (partition_data) => {
                committedOffsets[response.topic][partition_data.partition] = partition_data;                                
            });
        });

        _.each(results[1].responses, (response) => {            
            offsetsList[response.topic] = {};
            _.each(response.partitions, (partition_data) => {
                offsetsList[response.topic][partition_data.partition] = partition_data;                                
            });
        });


        const lag = {};
        _.each(offsetsList, (partitions, topic) => {        
            lag[topic] = {};
            _.each(partitions, (data) => {
                if (committedOffsets[topic][data.partition].error_code !== 0) {
                    lag[topic][data.partition] = -1;
                    return
                }

                let offset = 0;
                if (committedOffsets[topic][data.partition].offset > 0) {
                    offset = committedOffsets[topic][data.partition].offset;
                }

                lag[topic][data.partition] = data.offset - offset;
            });
        });

        console.log(JSON.stringify(lag, null, 2));
    });
});
