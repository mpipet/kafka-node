const cnst = require('../constants');

const schemas = {};

schemas[cnst.PRODUCE] = require('./produce');
schemas[cnst.FETCH] = require('./fetch');
schemas[cnst.OFFSETS] = require('./offsets');
schemas[cnst.METADATA] = require('./metadata');
schemas[cnst.LEADER_AND_ISR] = require('./leaderAndIsr');
schemas[cnst.JOIN_GROUP] = require('./joinGroup');
schemas[cnst.GROUP_COORDINATOR] = require('./groupCoordinator');

module.exports = schemas;
module.exports = schemas;