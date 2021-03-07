import { GraphQLFieldConfig, GraphQLID, GraphQLObjectType, GraphQLString } from 'graphql';
import { Context, List, GraphQLDateTime, GraphQLDate } from '../../shared/types';
import { UserCreateInput } from './inputs';
import { v4 as uuid } from 'uuid';

export const User = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    birthDate: { type: GraphQLDate },
    createdAt: { type: GraphQLDateTime },
    updatedAt: { type: GraphQLDateTime },
    deletedAt: { type: GraphQLDateTime },
  }
});

export const user: GraphQLFieldConfig<{}, Context> = {
  type: User,
  args: {
    id: { type: GraphQLString }
  },
  resolve: async (_, { id }, { knex }) => {
    const [user] = await knex.select().from('user').where({ id }).limit(1);

    return user;
  }
}

export const usersList: GraphQLFieldConfig<{}, Context> = {
  type: new List('UserListResponse', User),
  args: {

  },
  resolve: async (_, args, { knex }) => {
    const [{ count }] = await knex('user').count({ count: 'id' });
    const items = await knex.select('*').from('user');

    return { count: count, items: items }
  }
}

export const userCreate: GraphQLFieldConfig<{}, Context> = {
  type: User,
  args: {
    data: { type: UserCreateInput }
  },
  resolve: async (_, { data }, { knex }) => {    
    const id = uuid();

    await knex('user')
      .insert({
        id,
        first_name: data.firstName,
        last_name: data.lastName,
        birth_date: data.birthDate,
        email: data.email,
        password: data.password,
      });

    const [user] = await knex.select().from('user').where({ id }).limit(1);

    return {
      id: id,
      firstName: user.firstName,
      lastName: user.lastName,
      birthDate: user.birthDate,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    };
  }
}