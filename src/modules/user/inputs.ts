import { GraphQLInputObjectType, GraphQLNonNull, GraphQLString } from 'graphql';
import { IDPredicate, StringPredicate, DatePredicate, GraphQLDate, DateTimePredicate } from '../../shared/graphql-types';

export const UserCreateInput = new GraphQLInputObjectType({
  name: 'UserCreateInput',
  fields: {
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    birthDate: { type: new GraphQLNonNull(GraphQLDate) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) },
  }
});

export const UserFilter = new GraphQLInputObjectType({
  name: 'UserFilter',
  fields: {
    id: { type: IDPredicate },
    firstName: { type: StringPredicate },
    lastName: { type: StringPredicate },
    email: { type: StringPredicate },
    birthDate: { type: DatePredicate },
    createdAt: { type: DateTimePredicate },
    updatedAt: { type: DateTimePredicate },
    deletedAt: { type: DateTimePredicate },
  }
})