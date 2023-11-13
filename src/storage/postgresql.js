const { knex } = require('knex');

const config = require('../config');

const db = knex(config.knex);

module.exports = {
  db,
};
