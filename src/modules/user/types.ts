import { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLInt, GraphQLEnumType, GraphQLInputObjectType, GraphQLNonNull } from 'graphql'
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
    id: { type: GraphQLNonNull(GraphQLID) },
    firstName: { type: GraphQLNonNull(GraphQLString) },
    lastName: { type: GraphQLNonNull(GraphQLString) },
    email: { type: GraphQLNonNull(GraphQLString) },
    avatar: { type: GraphQLNonNull(GraphQLString) },
    role: { type: GraphQLNonNull(RolesType) },
    status: { type: GraphQLNonNull(StatusType) },
    stories: { type: GraphQLNonNull(UserStoriesCount) },
    createdAt: { type: GraphQLNonNull(GraphQLDateTime) },
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
