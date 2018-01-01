const _ = require('lodash');
const async = require('async');

const Client = require('./Client');
const Cluster = require('./Cluster2');

const cst = require('./protocol/constants');
const Response = require('./protocol/Response');
const Request = require('./protocol/Request');

const cluster = new Cluster('192.168.33.33:9092');
cluster.on('discovered', () => {

    cluster.getMetadatas(null, (metadatas) => {
        const topicsMeta = {};
        metadatas.topic_metadata.forEach((topic_meta) => {
            const partitions = _.map(topic_meta.topic_metadata, 'partition');
            topicsMeta[topic_meta.topic] = partitions; 
        });


        // cluster.getOffsetsList(topicsMeta, (data) => {
        //     console.log(data);


        // });

    });



});
// client.getMetadatas(null, (metadatas) => {

//     const cluster = new Cluster(metadatas);

//     const topicsPartitions = {};
//     metadatas.topic_metadata.forEach((topic_meta) => {
//         topicsPartitions[topic_meta.topic] = _.map(topic_meta.topic_metadata, 'partition'); 
//     });

//     const calls = [
//         (done) => cluster.getCommittedOffsets(
//             'live-deliveries',
//             topicsPartitions,
//             (data) => done(null, data)),
//         (done) => cluster.getOffsetsList(
//             topicsPartitions,
//             (data) => done(null, data))        
//     ];

//     async.parallel(calls, (err, results) => {

//         const committedOffsets = {};
//         const offsetsList = {};

//         _.each(results[0].responses, (response) => {            
//             committedOffsets[response.topic] = {};
//             _.each(response.partitions, (partition_data) => {
//                 committedOffsets[response.topic][partition_data.partition] = partition_data;                                
//             });
//         });

//         _.each(results[1].responses, (response) => {            
//             offsetsList[response.topic] = {};
//             _.each(response.partitions, (partition_data) => {
//                 offsetsList[response.topic][partition_data.partition] = partition_data;                                
//             });
//         });


//         const lag = {};
//         _.each(offsetsList, (partitions, topic) => {        
//             lag[topic] = {};
//             _.each(partitions, (data) => {
//                 if (committedOffsets[topic][data.partition].error_code !== 0) {
//                     lag[topic][data.partition] = -1;
//                     return
//                 }

//                 let offset = 0;
//                 if (committedOffsets[topic][data.partition].offset > 0) {
//                     offset = committedOffsets[topic][data.partition].offset;
//                 }

//                 lag[topic][data.partition] = data.offset - offset;
//             });
//         });

//         console.log(JSON.stringify(lag, null, 2));
//     });
// });
