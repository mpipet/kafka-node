const Client = require('./Client');
const Cluster = require('./Cluster');



// const payload = {};

// const options = {host: '192.168.33.33', port: 9092};

// const client = new Client();
// client.connect(options, () => {
//       client.send(cst.METADATA, 2, {topics: ['test'], allow_auto_topic_creation: false}, (err, metadata) => {
//         if (err) {
//             throw new Error(err);
//         }

//         client.close();
//       });
//     // client.send(cst.API_VERSIONS, 1, payload, (err, apiVersions) => {
//     //   console.log(apiVersions);
      

//     // });

//     // console.log('sended');
// });

// // client.on('response', (parsedData) => {
// //     console.log('response', parsedData);
// //     client.close();
// // })

// client.on('error', (error) => {
//     console.log('error', error);
// })

// client.on('close', () => {
//     console.log('close');
// })

const options = {
  'bootstrap.servers': '192.168.33.33:9092',
  'heartbeat.interval.ms': 2000
};

client = new Cluster(options);

client.on('ready', () => {
  console.log('ready');
  client.sendToRandomBroker(3, {'topics': null, allow_auto_topic_creation: false}, (err, data) => {
    console.log(err, data);
    client.close();

  })
  // client.metadata({'topics': [], allow_auto_topic_creation: false}, (err, data) => {
  //   if (err) throw new Error(err);
  //   console.log('data', data);
  // })
});

client.on('close', () => {
  console.log('close');
})

client.on('error', (err) => {
  console.log('error', err);
})