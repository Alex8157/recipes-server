require('dotenv').config();

const {
  // Database connection parameters
  DB_URL,
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_DATABASE,
  DB_SCHEMA,
  DB_SSL,
  // Connection pool parameters
  KNEX_POOL_MIN,
  KNEX_POOL_MAX,
  // Migrations state store parameters
  KNEX_MIGRATION_SCHEMA,
  KNEX_MIGRATION_TABLE,
  // Output parameters
  KNEX_DEBUG,
  //Port of service
  PORT,
  //Logs level
  LOGS_LEVEL,
  //Trusted URL
  TRUSTED_URL
} = process.env;

const config = {
  knex: {
    client: 'pg',
    connection: {
      connectionString: DB_URL && DB_URL.trim(),
      host: DB_HOST && DB_HOST.trim(),
      port: DB_PORT && Number.parseInt(DB_PORT, 10),
      user: DB_USERNAME && DB_USERNAME.trim(),
      database: DB_DATABASE && DB_DATABASE.trim(),
      password: DB_PASSWORD && DB_PASSWORD.trim(),
      schema: DB_SCHEMA && DB_SCHEMA.trim(),
      ssl: DB_SSL && Boolean(JSON.parse(DB_SSL)),
    },
    debug: KNEX_DEBUG ? Boolean(JSON.parse(KNEX_DEBUG)) : false,
    pool: {
      min: KNEX_POOL_MIN ? Number.parseInt(KNEX_POOL_MIN, 10) : 2,
      max: KNEX_POOL_MAX ? Number.parseInt(KNEX_POOL_MAX, 10) : 10,
    },
    migrations: {
      schemaName: KNEX_MIGRATION_SCHEMA
        ? KNEX_MIGRATION_SCHEMA.trim()
        : 'public',
      tableName: KNEX_MIGRATION_TABLE
        ? KNEX_MIGRATION_TABLE.trim()
        : 'migrations',
      directory: './src/migrations',
      stub: './migration.stub.js',
    },
  },
  port: PORT && Number.parseInt(PORT, 10),
  logsLevel: LOGS_LEVEL || 'info',
  trustedURL: TRUSTED_URL || 'http://localhost:3000',
};

module.exports = config;
