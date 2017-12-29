const _ = require('lodash');
const async = require('async');

const Request = require('./protocol/Request');
const Response = require('./protocol/Response');
const cst = require('./protocol/constants');
const Client = require('./Client');

class Cluster {

    constructor(metadatas) {
        this.brokers = {};
        metadatas.brokers.forEach((broker) => {
            this.brokers[broker.node_id] = broker;
        });

        this.topic_metadata = {};
        metadatas.topic_metadata.forEach((metadata) => {
            this.topic_metadata[metadata.topic] = {};
            metadata.topic_metadata.forEach((partition_metadata) => {
                this.topic_metadata[metadata.topic][partition_metadata.partition] = partition_metadata.leader;
            });
        });
    }

    setMetadatas(metadatas) {
     
    }

    getPartitionTopicsByBrokers(partitionTopics) {
        const partitionTopicsByBrokers = {};
        _.each(partitionTopics, (partitionTopic, topic) => {        
            _.each(partitionTopic, (partition) => {
                const leader = this.topic_metadata[topic][partition];
                if (typeof partitionTopicsByBrokers[leader] === 'undefined') {
                    partitionTopicsByBrokers[leader] = {};
                }

                if (typeof partitionTopicsByBrokers[leader][topic] === 'undefined') {
                    partitionTopicsByBrokers[leader][topic] = [];
                }
                partitionTopicsByBrokers[leader][topic].push(partition);
            });
        });
        return partitionTopicsByBrokers;
    }



    findCoordinator(group, callback) {
        const payload = {
            group_id: group
        };

        const correlationId = 666;

        const request = new Request(cst.FIND_COORDINATOR, 0, cst.CLIENT_ID);
        const requestPayload = request.getRequestPayload(payload, correlationId);
        const size = request.getSize(requestPayload);
        const buff = Buffer.alloc(size);
        const offset = request.write(buff, requestPayload, 0);

        const broker = this.brokers[0].host + ':' + this.brokers[0].port;

        const client = new Client(broker);

        client.send(buff, (buff) => {
            const response = new Response(buff, cst.FIND_COORDINATOR, 0);
            const data = response.read();
            callback(data);
        })
    }



    getCommittedOffsets(consumerGroup, partitionTopics, callback) {
        const topics = _.map(partitionTopics, (partitions, topic) => {
            return {
                topic: topic,
                partitions: partitions
            }
        });

        const payload = {
            consumer_group: consumerGroup,
            topics: topics
        };

        const correlationId = 666;

        const request = new Request(cst.OFFSETS_FETCH, 1, cst.CLIENT_ID);
        const requestPayload = request.getRequestPayload(payload, correlationId);
        const size = request.getSize(requestPayload);
        const buff = Buffer.alloc(size);
        const offset = request.write(buff, requestPayload, 0);

        this.findCoordinator(consumerGroup, (coordinator) => {

            const broker = coordinator.host + ':' + coordinator.port;

            const client = new Client(broker);

            client.send(buff, (buff) => {

                const response = new Response(buff, cst.OFFSETS_FETCH, 1);
                const data = response.read();
                callback(data);
            })
        });












        // const partitionTopicsByBrokers = this.getPartitionTopicsByBrokers(partitionTopics);
        // const payloadByBrokers = {};

        // _.each(partitionTopicsByBrokers, (partitionTopics, leader) => {
        //     const topics = _.map(partitionTopics, (partitions, topic) => {
        //         return {
        //             topic: topic,
        //             partitions: partitions
        //         }
        //     });

        //     const payload = {
        //         consumer_group: consumerGroup,
        //         topics: topics
        //     };

        //     payloadByBrokers[leader] = payload;
        // });

        // const requests = _.map(payloadByBrokers, (payload, leader) => {
        //     return (done) => {                
        //         const correlationId = 666;

        //         const request = new Request(cst.OFFSETS_FETCH, 1, cst.CLIENT_ID);
        //         const requestPayload = request.getRequestPayload(payload, correlationId);
        //         const size = request.getSize(requestPayload);
        //         const buff = Buffer.alloc(size);
        //         const offset = request.write(buff, requestPayload, 0);

        //         const broker = this.brokers[leader].host + ':' + this.brokers[leader].port;

        //         const client = new Client(broker);

        //         client.send(buff, (buff) => {

        //             const response = new Response(buff, cst.OFFSETS_FETCH, 1);
        //             const data = response.read();
        //             done(null, data);
        //         })

        //     }

        // });

        // async.parallel(requests, (err, results) => {
        //     const partitionsByTopic = {};
        //     _.each(results, (response) => {
        //       _.each(response.responses, (topicResponse) => {
        //         if (typeof partitionsByTopic[topicResponse.topic] === 'undefined') {
        //           partitionsByTopic[topicResponse.topic] = [];
        //         }

        //         partitionsByTopic[topicResponse.topic] = _.concat(partitionsByTopic[topicResponse.topic], topicResponse.partitions);
        //       });
        //     });

        //     const mergedResponse = _.map(partitionsByTopic, (partitions, topic) => {
        //       return {
        //         topic: topic,
        //         partitions: partitions
        //       }
        //     });

        //     results[0].responses = mergedResponse; 

        //     callback(results[0])
        // });
    }

    getOffsetsList(partitionTopics, callback) {
        const partitionTopicsByBrokers = this.getPartitionTopicsByBrokers(partitionTopics);
        const payloadByBrokers = {};

        _.each(partitionTopicsByBrokers, (partitionTopics, leader) => {

            const topics = _.map(partitionTopics, (partitions, topic) => {

                const offsetPartitions = _.map(partitions, (partition) => {
                    return {
                        partition: partition,
                        timestamp: -1
                    }
                });

                return {
                    topic: topic,
                    partitions: offsetPartitions
                }
            });

            const payload = {
                replica_id: -1,
                topics: topics
            };
            payloadByBrokers[leader] = payload;
        });


        const requests = _.map(payloadByBrokers, (payload, leader) => {
            return (done) => {                
                const correlationId = 666;

                const request = new Request(cst.OFFSETS, 1, cst.CLIENT_ID);
                const requestPayload = request.getRequestPayload(payload, correlationId);

                const size = request.getSize(requestPayload);
                const buff = Buffer.alloc(size);
                const offset = request.write(buff, requestPayload, 0);

                const broker = this.brokers[leader].host + ':' + this.brokers[leader].port;

                const client = new Client(broker);

                client.send(buff, (buff) => {
                    const response = new Response(buff, cst.OFFSETS, 1);
                    const data = response.read();
                    done(null, data);
                })
            }

        });




        async.parallel(requests, (err, results) => {
            const partitionsByTopic = {};
            _.each(results, (response) => {
              _.each(response.responses, (topicResponse) => {
                if (typeof partitionsByTopic[topicResponse.topic] === 'undefined') {
                  partitionsByTopic[topicResponse.topic] = [];
                }

                partitionsByTopic[topicResponse.topic] = _.concat(partitionsByTopic[topicResponse.topic], topicResponse.partitions);
              });
            });

            const mergedResponse = _.map(partitionsByTopic, (partitions, topic) => {
              return {
                topic: topic,
                partitions: partitions
              }
            });

            results[0].responses = mergedResponse; 

            callback(results[0])
        });

    }
}

module.exports = Cluster;