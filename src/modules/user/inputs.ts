import { GraphQLInputObjectType, GraphQLNonNull, GraphQLString } from 'graphql';

export const UserCreateInput = new GraphQLInputObjectType({
  name: 'UserCreateInput',
  fields: {
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) },
  }
});