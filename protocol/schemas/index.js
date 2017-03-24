const cnst = require('../constants');

const schemas = {};

schemas[cnst.PRODUCE] = require('./produce');
schemas[cnst.FETCH] = require('./fetch');
schemas[cnst.OFFSETS] = require('./offsets');
schemas[cnst.METADATA] = require('./metadata');

module.exports = schemas;