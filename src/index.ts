import express, { Response } from 'express'
import { graphqlHTTP } from 'express-graphql'
import schema from './modules/schema'
import knex from './shared/configuration/knex'
import { authenticate } from './shared/middlewares/authenticate'
import { injectAuth } from './shared/middlewares/inject-auth'
import cors from 'cors'

console.log('CI with knexfile, take VII')

const app = express()
const port = process.env.PORT || 4000

app.use(cors())

if (process.env.NODE_ENV !== 'production') {
  app.post('/graphql', injectAuth)
}

app.post('/graphql', authenticate)

app.use('/graphql', graphqlHTTP((_, res) => {
  const { locals } = <Response> res

  return {
    schema: schema,
    context: {
      knex,
      user: locals.user
    },
    graphiql: process.env.NODE_ENV === 'development'
  }
}))

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Running a GraphQL server at port ${port}`)
  })
}

export default app
