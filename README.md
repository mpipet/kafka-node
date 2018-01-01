kafka-node
=============
### A Kafka protocol client

This client is primarily intended to administrate your kafka cluster, not only to produce and consume.
It exposes protocol api directly and some additional functionalities. 

Installation
------------

TO BE SET ON NPM

Examples
--------

``` javascript
const options = {
  'bootstrap.servers': '127.0.0.1:9092',
  'heartbeat.interval.ms': 2000
};

cluster = new Cluster(options);

// Metadata api
const apiKey = 3;
const payload = {'topics': null, allow_auto_topic_creation: false}

cluster.on('ready', () => {
  console.log('ready');
  cluster.sendToRandomBroker(apiKey, payload, (err, data) => {
    console.log('METADATA', data);
    cluster.close();

  })
});

cluster.on('close', () => {
  console.log('close');
})

cluster.on('error', (err) => {
  console.log('error', err);
})

```

Options
--------

Property                                 |       Default   | Description              
-----------------------------------------|-----------------|--------------
bootstrap.servers                        |  None  | Initial list of brokers as a CSV list of broker host or host:port. Its used by the client to discover all the other cluster members.
heartbeat.interval.ms                    |  1000  | Unlike a classic consumer, the client maintain an open connection with all the brokers of the cluster, to avoid the disconnection due to the connection.max.idle.ms time limit, an apiVersion request is made using this interval configuration  <br>*Type: integer*