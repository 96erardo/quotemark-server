const { writeFile } = require('fs')

writeFile(
  'app.yaml',
  'runtime: nodejs14' + '\n' +
  'service: ' + process.env.SERVICE + '\n' +
  'env_variables:' + '\n' +
  '  NODE_ENV: "' + process.env.NODE_ENV + '"\n' +
  '  DB_CLIENT: "' + process.env.DB_CLIENT + '"\n' +
  '  DB_HOST: "' + process.env.DB_DEPLOY_HOST + '"\n' +
  '  DB_USER: "' + process.env.DB_USER + '"\n' +
  '  DB_PASSWORD: "' + process.env.DB_PASSWORD + '"\n' +
  '  DB_NAME: "' + process.env.DB_NAME + '"\n' +
  '  DB_SOCKET_PATH: "' + process.env.DB_DEPLOY_SOCKET_PATH + '"\n' +
  '  GOOGLE_AUTH_CLIENT_ID: "' + process.env.GOOGLE_AUTH_CLIENT_ID + '"\n' +
  '  GOOGLE_AUTH_CLIENT_SECRET: "' + process.env.GOOGLE_AUTH_CLIENT_SECRET + '"\n',
  (err) => {
    if (err) { throw err }

    console.log('Configuration file generated successfully')
  }
)
