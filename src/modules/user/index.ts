import { GraphQLFieldConfig, GraphQLID, GraphQLInt, GraphQLObjectType, GraphQLString } from 'graphql'
import { List, GraphQLDateTime } from '../../shared/graphql-types'
import { UserCreateInput, UserFilter, UserUpdateInput } from './inputs'
import { bookmarksList, BookmarkListResponse } from '../bookmark'
import { BookmarkFilter } from '../bookmark/inputs'
import { Context, ListArguments } from '../../shared/types'
import { v4 as uuid } from 'uuid'
import { createFilter } from '../../shared/utils'
import { inspect } from 'util'

export const User: GraphQLObjectType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    avatar: { type: GraphQLString },
    bookmarks: {
      type: BookmarkListResponse,
      args: {
        filter: { type: BookmarkFilter },
        first: { type: GraphQLInt },
        skip: { type: GraphQLInt }
      },
      resolve: async (source, args, context, info) => {
        if (bookmarksList.resolve && source.id) {
          return await bookmarksList.resolve({ userId: source.id }, args, context, info)
        }

        return { count: 0, items: [] }
      }
    },
    createdAt: { type: GraphQLDateTime },
    updatedAt: { type: GraphQLDateTime },
    deletedAt: { type: GraphQLDateTime }
  })
})

export type UserType = {
  id: string,
  firstName: string,
  lastName: string,
  email: string,
  avatar: string,
  createdAt: string,
  updatedAt: string,
  deletedAt: string,
}

export const user: GraphQLFieldConfig<{}, Context> = {
  type: User,
  resolve: async (_, args, { user }) => user
}

export const UserListResponse = new List('UserListResponse', User)

export const usersList: GraphQLFieldConfig<{}, Context, ListArguments<UserType>> = {
  type: UserListResponse,
  args: {
    filter: { type: UserFilter },
    first: { type: GraphQLInt },
    skip: { type: GraphQLInt }
  },
  resolve: (_, { first, skip, ...rest }, { knex }) => {
    const query = knex('user')

    if (rest.filter) { createFilter(query, rest.filter) }

    if (first) { query.limit(first) }

    if (skip) { query.offset(skip) }

    return { query }
  }
}

export const userCreate: GraphQLFieldConfig<{}, Context> = {
  type: User,
  args: {
    data: { type: UserCreateInput }
  },
  resolve: async (_, { data }, { knex }) => {
    const id = uuid()

    await knex('user')
      .insert({
        id,
        first_name: data.firstName,
        last_name: data.lastName,
        birth_date: data.birthDate,
        email: data.email,
        password: data.password
      })

    const [user] = await knex.select().from('user').where({ id }).limit(1)

    return {
      id: id,
      firstName: user.firstName,
      lastName: user.lastName,
      birthDate: user.birthDate,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt
    }
  }
}

export const userUpdate: GraphQLFieldConfig<{}, Context> = {
  type: User,
  args: {
    data: { type: UserUpdateInput }
  },
  resolve: async (_, { data }, { knex, user }) => {
    const res = await knex('user')
      .where('id', user.id)
      .update({
        first_name: data.firstName && user.firstName,
        last_name: data.lastName && user.lastName
      }, [
        'id',
        'first_name',
        'last_name',
        'email',
        'avatar',
        'role',
        'status',
        'created_at',
        'updated_at',
        'deleted_at'
      ])

    console.log('user', inspect(res, false, 10))

    const [updated] = res

    return updated
  }
}
