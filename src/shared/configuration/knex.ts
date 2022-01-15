import knex from 'knex'
import { convertToCamel } from '../utils'

export default knex({
  client: process.env.DB_CLIENT,
  debug: process.env.NODE_ENV === 'development',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    socketPath: process.env.DB_SOCKET_PATH
  },
  postProcessResponse: result => {
    if (Array.isArray(result)) {
      return result.map(row => convertToCamel(row))
    } else {
      return convertToCamel(result)
    }
  }
})
