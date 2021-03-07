import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import schema from './modules/schema';
import knex from './shared/configuration/knex';

const app = express();

app.use('/graphql', graphqlHTTP({
  schema: schema,
  context: { knex },
  graphiql: true,
}));

app.listen(4000, () => {
  console.log('Running a GraphQL API server at http://localhost:4000/graphql');
});