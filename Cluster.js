const _ = require('lodash');
const async = require('async');

const Client = require('./Client');
const Request = require('./protocol/Request');
const cst = require('./protocol/constants');

const EventEmitter = require('events').EventEmitter;

class Cluster extends EventEmitter {

  constructor(options) {    
    super();

    if (typeof options['bootstrap.servers'] === 'undefined') {
      throw new Error('bootstrap.servers not set');
    }

    const serversList = options['bootstrap.servers'].split(',');
    this.bootstrapServers = _.map(serversList, (server) => {
      const tmp = server.split(':');
      return {
        host: tmp[0],
        port: tmp[1]
      };
    });

    this.heartbeatInterval = typeof options['heartbeat.interval.ms'] !== 'undefined' ?
      options['heartbeat.interval.ms'] :
      1000;

    this.brokers = {};
    this.apiVersions = {};
    this.connections = {};
    this.heartbeats = [];

    this.discover(() => {
      this.emit('ready');
    });
  }

  discover(callback) {
    // choose randomly one of the bootstrap servers
    const serversNumber = Object.keys(this.bootstrapServers).length;
    const serverIndex = Math.floor(Math.random() * serversNumber);

    const server = this.bootstrapServers[serverIndex];

    //@TODO use async to make the code cleaner
    const client = new Client();   

    client.once('end', () => {
      const error = 'Broker at ' + server.host + ':' + server.port + ' closed the connection';
      this.emit('error', error);
      client.close()
    });

    client.connect(server, () => {

      // detect cluster api versions 
      client.send(cst.API_VERSIONS, 0, [], (err, apiVersions) => {
        if (err) throw new Error(err);
        this.apiVersions = _.keyBy(apiVersions.api_versions, 'api_key');

        // retrieve cluster members
        client.send(cst.METADATA, 0, {topics: []}, (err, metadata) => {
          if (err) throw new Error(err);
          this.brokers = metadata.brokers;
          this.connect(metadata.brokers, () => {           
            callback();
            client.close();
          });
        });
      });
    });
  }

  setHeartBeats() {
    _.each(this.connections, (connection) => {
      const heartbeat = setInterval(() => connection.send(cst.API_VERSIONS, 0, [], () => {}), this.heartbeatInterval);
      this.heartbeats.push(heartbeat);
    });     
  }

  clearheartBeats() {
    _.each(this.heartbeats, (heartbeat) => {
      clearInterval(heartbeat);
    });
    this.heartbeats = [];
  }

  connect(brokersConfigs, callback) {
    const configs = _.keyBy(brokersConfigs, 'node_id');
    _.each(configs, (brokerConf, brokerId) => {
      const client = new Client();
      this.connections[brokerId] = client;
      // handle case where one of the broker disconnect
      client.once('end', () => {
        const error = 'Broker ' + brokerId + ' at ' + brokerConf.host + ':' + brokerConf.port + ' closed the connection';
        this.emit('error', error);
        this.close()
      });
    });

    const requests = _.map(configs, (brokerConf, brokerId) => {
      return (done) => {
          //@TODO return error directly in connect callback for easyer error handling??
          // close other open sockets in case one fail to connect
          const onerror = (err) => {
            this.close();
            done(err);            
          };
          const client = this.connections[brokerId];
          client.once('error', onerror);
          this.connections[brokerId].connect(brokerConf, () => {
            client.removeListener('error', onerror);
            done(null);
          });
        };
    });

    async.parallel(requests, (err) => {
      if (err) throw new Error(err);
      this.setHeartBeats();
      callback();
    });  
  }  

  sendToRandomBroker(apiKey, payload, callback) {
    const clusterSize = Object.keys(this.brokers).length;
    const brokerIndex = Math.floor(Math.random() * clusterSize);
    const brokerId = this.brokers[brokerIndex].node_id;

    const apiVersion = this.getBestApiVersion(apiKey);
    this.connections[brokerId].send(apiKey, apiVersion, payload, callback);
  }

  sendToCoordinators() {

  }

  sendToLeaders() {
    
  }

  getBestApiVersion(apiKey) {
    const brokerApiVersion = this.apiVersions[cst.METADATA].max_version;
    const libApiVersion = Request.getbestApiVersion(apiKey);
    return libApiVersion < brokerApiVersion ? libApiVersion : brokerApiVersion;
  }  

  close() {
    this.clearheartBeats();
    const closedCbs = [];
    _.each(this.connections, (connection) => {
      //@TOOD expose client closed/destroyed attribute to mimic the socket.destroyed attribute 
      if (connection.socket.destroyed === false) {
        connection.close();        
        closedCbs.push((done) => connection.once('close', () =>  done()));
      }      
    })

    async.parallel(closedCbs, () => {
      this.connections = {};
      this.emit('close');
    });
  }

}

module.exports = Cluster;