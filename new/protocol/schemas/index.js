const cnst = require('../constants');

const schemas = {};

// schemas[cnst.PRODUCE] = require('./produce');
// schemas[cnst.FETCH] = require('./fetch');
// schemas[cnst.OFFSETS] = require('./offsets');
schemas[cnst.METADATA] = require('./metadata');
// schemas[cnst.METADATA] = require('./metadata');
// schemas[cnst.LEADER_AND_ISR] = require('./leaderAndIsr');
// schemas[cnst.OFFSETS_FETCH] = require('./offsetsFetch');
// schemas[cnst.JOIN_GROUP] = require('./joinGroup');
schemas[cnst.FIND_COORDINATOR] = require('./findCoordinator');
// schemas[cnst.HEARTBEAT] = require('./heartbeat');
// schemas[cnst.DESCRIBE_GROUPS] = require('./describeGroups');
schemas[cnst.API_VERSIONS] = require('./apiVersions');

module.exports = schemas;