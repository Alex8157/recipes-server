const config = require('./config');
const interfaces = require('./interfaces');
const { db } = require('./storage');

const main = async () => {
  try {
    await db.migrate.latest();
    Promise.all(interfaces.map((entry) => entry.start(config)));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = main;
