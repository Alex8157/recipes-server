const fs = require('node:fs');

const up = knex => knex.raw(fs.readFileSync(__filename.replace('.js', '.up.sql'), { encoding: 'utf-8' }));
const down = knex => knex.raw(fs.readFileSync(__filename.replace('.js', '.down.sql'), { encoding: 'utf-8' }));

module.exports = { up, down };
