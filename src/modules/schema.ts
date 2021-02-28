import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { user, usersList, userCreate } from './user';

export default new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      user,
      usersList
    }
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      userCreate
    }
  })
});