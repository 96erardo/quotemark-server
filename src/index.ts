import express, { Response } from 'express';
import { graphqlHTTP } from 'express-graphql';
import schema from './modules/schema';
import knex from './shared/configuration/knex';
import { authenticate } from './shared/middlewares/authentication';
import cors from 'cors';

const app = express();


app.use(cors());

app.post('/graphql', authenticate);

app.use('/graphql', graphqlHTTP((_, res) => {
  const { locals } = <Response> res;

  return {
    schema: schema,
    context: {
      knex,
      user: locals.user,
    },
    graphiql: true,
  }
}));

app.listen(4000, () => {
  console.log('Running a GraphQL API server at http://localhost:4000/graphql');
});