const cnst = require('../constants');

const schemas = {};

schemas[cnst.PRODUCE] = require('./produce');
schemas[cnst.FETCH] = require('./fetch');
schemas[cnst.OFFSETS] = require('./offsets');
schemas[cnst.METADATA] = require('./metadata');
schemas[cnst.LEADER_AND_ISR] = require('./leaderAndIsr');

module.exports = schemas;