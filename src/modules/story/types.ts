import { 
  GraphQLObjectType, 
  GraphQLID, 
  GraphQLString, 
  GraphQLInputObjectType,
  GraphQLEnumType,
  GraphQLNonNull,
} from 'graphql'
import { GraphQLDateTime } from '../../shared/graphql-types'
import { User, user } from '../user'

export const Story = new GraphQLObjectType({
  name: 'Story',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    color: { type: GraphQLNonNull(GraphQLString) },
    typography: { type: GraphQLNonNull(Typography) },
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
    updatedAt: { type: GraphQLNonNull(GraphQLDateTime) },
    deletedAt: { type: GraphQLDateTime }
  })
})

export const Typography = new GraphQLEnumType({
  name: 'Typography',
  values: {
    Arial: { value: 'Arial' },
    Poppins: { value: 'Poppins' },
    Barlow: { value: 'Barlow' },
  }
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
  typography: string,
  content: string,
  link: string,
  createdAt: string,
  updatedAt: string,
  deletedAt: string,
}
