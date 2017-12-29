const _ = require('lodash');
const async = require('async');

const Request = require('./protocol/Request');
const Response = require('./protocol/Response');
const cst = require('./protocol/constants');
const Client = require('./Client');
const Connection = require('./Connection');
const EventEmitter = require('events').EventEmitter;


class Cluster extends EventEmitter {

    constructor(bootstrapServer) {
      super();
      this.bootstrapServer = bootstrapServer;
      this.getMembers((members) => {
        this.brokers = members.brokers;
        this.emit('discovered');
      });
    }

    sendToBootstrapServer(payload, apiKey, version, callback) {
      const correlationId = 666;

      const request = new Request(apiKey, version, cst.CLIENT_ID);
      const fullPayload = request.getRequestPayload(payload, correlationId);

      const size = request.getSize(fullPayload);
      const buff = Buffer.alloc(size);
      const offset = request.write(buff, fullPayload, 0);

      const conn = new Connection(this.bootstrapServer);

      conn.send(buff, (buff) => {
          const response = new Response(buff, apiKey, version);
          const data = response.read();
          callback(data); 
      })
    }

    sendToLeaders() {
      //get metadatas first
    }

    sendToCoordinators(payload, consumerGroup, apiKey, version, callback) {
      //find coordinator first 
      this.findCoordinator(consumerGroup, (broker) => {


      });
    }

    sendToRandomBroker(payload, apiKey, version, callback) {
      const correlationId = 666;

      const request = new Request(apiKey, version, cst.CLIENT_ID);
      const fullPayload = request.getRequestPayload(payload, correlationId);

      const size = request.getSize(fullPayload);
      const buff = Buffer.alloc(size);
      const offset = request.write(buff, fullPayload, 0);

      const broker = this.getRandomBroker();

      const conn = new Connection(this.brokerToString(broker));

      conn.send(buff, (buff) => {
          const response = new Response(buff, apiKey, version);
          const data = response.read();
          callback(data); 
      })

    }

    findCoordinator(consumerGroup, callback) {
      const payload = {
        group_id: consumerGroup
      };

      sendToRandomBroker(payload, cst.FIND_COORDINATOR, 0, callback);
    }

    getMembers(callback) {
      const payload = {
          topics: []
      };

      this.sendToBootstrapServer(payload, cst.METADATA, 2, callback);    
    }

    getRandomBroker() {
      const clusterSize = Object.keys(this.brokers).length;
      const brokerIndex = Math.floor(Math.random() * (clusterSize - 0) + 0);
      return this.brokers[brokerIndex];
    }

    brokerToString(broker) {
      return broker.host + ':' + broker.port;
    }

    getMetadatas(topics, callback) {
      const payload = {
          topics: topics
      };

      this.sendToRandomBroker(payload, cst.METADATA, 2, (data) => {
        data.topic_metadata = _.filter(data.topic_metadata, ['is_internal', false]);
        callback(data); 

      });
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