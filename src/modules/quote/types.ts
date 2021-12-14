import { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLInputObjectType, GraphQLNonNull } from 'graphql'
import { GraphQLDateTime } from '../../shared/graphql-types'
import { User, user } from '../user'

export const Quote = new GraphQLObjectType({
  name: 'Quote',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID), },
    name: { type: GraphQLNonNull(GraphQLString) },
    content: { type: GraphQLNonNull(GraphQLString) },
    link: { type: GraphQLNonNull(GraphQLString) },
    user: {
      type: GraphQLNonNull(User),
      resolve: async (data, _, context, info) => {
        if (user.resolve) {
          return await user.resolve({}, { id: data.userId }, context, info)
        }

        return null
      }
    },
    createdAt: { type: GraphQLNonNull(GraphQLDateTime) },
    updatedAt: { type: GraphQLDateTime },
    deletedAt: { type: GraphQLDateTime }
  })
})

export const QuoteKeyFilter = new GraphQLInputObjectType({
  name: 'QuoteKeyFilter',
  fields: {
    id: {
      type: GraphQLID
    }
  }
})

export type QuoteType = {
  id: string,
  name: string,
  content: string,
  link: string,
  createdAt: string,
  updatedAt: string,
  deletedAt: string,
}
