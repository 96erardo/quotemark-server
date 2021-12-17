const dotenv = require('dotenv');

dotenv.config();

console.log('client', process.env.DB_CLIENT);

module.exports = {
  [process.env.NODE_ENV as string]: {
    client: process.env.DB_CLIENT,
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      socketPath: process.env.DB_SOCKET_PATH,
    },
    migrations: {
      tableName: 'knex_migrations',
      extension: 'ts',
    },
    seeds: {
      directory: process.env.DB_SEEDERS_DIR // './seeds/test'
    }
  }
};