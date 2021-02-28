import { GraphQLFieldConfig, GraphQLID, GraphQLObjectType, GraphQLString } from 'graphql';
import { Context, List } from '../../shared/types';
import {
  UserCreateInput
} from './inputs';

export const User = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    deletedAt: { type: GraphQLString },
  }
});

export const user: GraphQLFieldConfig<{}, Context> = {
  type: User,
  args: {
    id: { type: GraphQLString }
  },
  resolve: async (_, { id }, { knex }) => {
    const [user] = await knex.select().from('user').where({ id }).limit(1);

    return {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      deletedAt: user.deleted_at,
    }
  }
}

export const usersList: GraphQLFieldConfig<{}, Context> = {
  type: new List('UserListResponse', User),
  resolve: async (_, args, { knex }) => {
    const [{ count }] = await knex('user').count({ count: 'id' });
    const items = await knex.select('*').from('user');

    return {
      count: count,
      items: items.map(item => ({
        id: item.id,
        firstName: item.first_name,
        lastName: item.last_name,
        email: item.email,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        deletedAt: item.deleted_at,  
      }))
    }
  }
}

export const userCreate: GraphQLFieldConfig<{}, Context> = {
  type: User,
  args: {
    data: { type: UserCreateInput }
  },
  resolve: async (_, { data }, { knex }) => {    
    const [id] = await knex('user')
      .returning('id')
      .insert({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        password: data.password,
      });

    const [user] = await knex.select().from('user').where({ id }).limit(1);

    return {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      deletedAt: user.deleted_at,
    };
  }
}