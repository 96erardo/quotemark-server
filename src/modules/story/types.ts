import { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLInputObjectType } from 'graphql'
import { GraphQLDateTime } from '../../shared/graphql-types'
import { User, user } from '../user'

export const Story = new GraphQLObjectType({
  name: 'Story',
  fields: () => ({
    id: { type: GraphQLID },
    color: { type: GraphQLString },
    content: { type: GraphQLString },
    link: { type: GraphQLString },
    user: {
      type: User,
      resolve: async (data, _, context, info) => {
        if (user.resolve) {
          return await user.resolve({}, { id: data.userId }, context, info)
        }

        return null
      }
    },
    createdAt: { type: GraphQLDateTime },
    updatedAt: { type: GraphQLDateTime },
    deletedAt: { type: GraphQLDateTime }
  })
})

export const StoryKeyFilter = new GraphQLInputObjectType({
  name: 'StoryKeyFilter',
  fields: {
    id: {
      type: GraphQLID
    }
  }
})

export type StoryType = {
  id: string,
  color: string,
  content: string,
  link: string,
  createdAt: string,
  updatedAt: string,
  deletedAt: string,
}
