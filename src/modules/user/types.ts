import { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLInt, GraphQLEnumType, GraphQLInputObjectType } from 'graphql'
import { GraphQLDateTime } from '../../shared/graphql-types'

export const RolesType = new GraphQLEnumType({
  name: 'Role',
  values: {
    admin: { value: 'admin' },
    user: { value: 'user' }
  }
})

export const StatusType = new GraphQLEnumType({
  name: 'Status',
  values: {
    active: { value: 'active' },
    banned: { value: 'banned' }
  }
})

export const UserStoriesCount = new GraphQLObjectType({
  name: 'UserStoriesCount',
  fields: {
    count: {
      type: GraphQLInt
    }
  }
})

export const User: GraphQLObjectType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    avatar: { type: GraphQLString },
    role: { type: RolesType },
    status: { type: StatusType },
    stories: { type: UserStoriesCount },
    createdAt: { type: GraphQLDateTime },
    updatedAt: { type: GraphQLDateTime },
    deletedAt: { type: GraphQLDateTime }
  })
})

export const UserKeyFilter = new GraphQLInputObjectType({
  name: 'UserKeyFilter',
  fields: {
    id: {
      type: GraphQLID
    }
  }
})

export type UserType = {
  id: string,
  firstName: string,
  lastName: string,
  email: string,
  avatar: string,
  status: 'active' | 'banned',
  role: 'admin' | 'user',
  createdAt: string,
  updatedAt: string,
  deletedAt: string,
}
