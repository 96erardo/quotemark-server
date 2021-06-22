import { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLInt, GraphQLEnumType, GraphQLList } from 'graphql'
// import { BookmarkListResponse } from '../quote/index'
// import { BookmarkFilter } from '../quote/inputs'
import { GraphQLDateTime } from '../../shared/graphql-types'
// import { bookmarksList } from '../quote'

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
    bookmarks: {
      type: GraphQLList(GraphQLString),
      args: {
        // filter: { type: BookmarkFilter },
        first: { type: GraphQLInt },
        skip: { type: GraphQLInt }
      },
      resolve: async (source, args, context, info) => {
        // if (bookmarksList.resolve && source.id) {
        //   return await bookmarksList.resolve({ userId: source.id }, args, context, info)
        // }

        return []
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
  status: 'active' | 'banned',
  role: 'admin' | 'user',
  createdAt: string,
  updatedAt: string,
  deletedAt: string,
}
