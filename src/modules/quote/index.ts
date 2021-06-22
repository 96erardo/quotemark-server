export * from './quoteCreate'
export * from './quoteUpdate'
export * from './quoteDelete'
export * from './quotesList'

// import { GraphQLFieldConfig, GraphQLID, GraphQLInt, GraphQLObjectType, GraphQLString } from 'graphql'
// import { List, GraphQLDateTime } from '../../shared/graphql-types'
// import { Context, ListArguments } from '../../shared/types'
// import { createFilter } from '../../shared/utils'
// import { BookmarkFilter, BookmarkCreateInput } from './inputs'
// import { User } from '../user/types'
// import { user } from '../user/user'
// import { v4 as uuid } from 'uuid'

// type Source = Partial<{
//   userId: string
// }>

// export const Bookmark = new GraphQLObjectType({
//   name: 'Bookmark',
//   fields: () => ({
//     id: { type: GraphQLID },
//     name: { type: GraphQLString },
//     content: { type: GraphQLString },
//     link: { type: GraphQLString },
//     user: {
//       type: User,
//       resolve: async (data, _, context, info) => {
//         if (user.resolve) {
//           return await user.resolve({}, { id: data.userId }, context, info)
//         }

//         return null
//       }
//     },
//     createdAt: { type: GraphQLDateTime },
//     updatedAt: { type: GraphQLDateTime },
//     deletedAt: { type: GraphQLDateTime }
//   })
// })

// export type BookmarkType = {
//   id: string,
//   name: string,
//   content: string,
//   link: string,
//   createdAt: string,
//   updatedAt: string,
//   deletedAt: string,
// }

// export const bookmark: GraphQLFieldConfig<Source, Context> = {
//   type: Bookmark,
//   args: {
//     id: { type: GraphQLString }
//   },
//   resolve: async (_, { id }, { knex }) => {
//     const [bookmark] = await knex.select().from('bookmark').where({ id }).limit(1)

//     return bookmark || null
//   }
// }

// export const BookmarkListResponse = new List('BookmarkListResponse', Bookmark)

// export const bookmarksList: GraphQLFieldConfig<Source, Context, ListArguments<BookmarkType>> = {
//   type: BookmarkListResponse,
//   args: {
//     filter: { type: BookmarkFilter },
//     first: { type: GraphQLInt },
//     skip: { type: GraphQLInt }
//   },
//   resolve: async (source, { first, skip, filter }, { knex }) => {
//     const query = knex('bookmark')

//     if (source && source.userId) {
//       query.where('user_id', source.userId)
//     }

//     if (filter) { createFilter(query, filter) }

//     if (first) { query.limit(first) }

//     if (skip) { query.offset(skip) }

//     return { query }
//   }
// }

// export const bookmarkCreate: GraphQLFieldConfig<{}, Context> = {
//   type: Bookmark,
//   args: {
//     data: { type: BookmarkCreateInput }
//   },
//   resolve: async (_, { data }, { knex }) => {
//     const id = uuid()

//     await knex('bookmark')
//       .insert({
//         id,
//         name: data.name,
//         content: data.content,
//         link: data.link,
//         user_id: data.user.connect.id
//       })

//     const [bookmark] = await knex.select().from('bookmark').where({ id }).limit(1)

//     return bookmark
//   }
// }
