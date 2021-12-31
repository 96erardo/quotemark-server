import { 
  GraphQLObjectType, 
  GraphQLID, 
  GraphQLString, 
  GraphQLInputObjectType,
  GraphQLEnumType
} from 'graphql'
import { GraphQLDateTime } from '../../shared/graphql-types'
import { User, user } from '../user'

export const Story = new GraphQLObjectType({
  name: 'Story',
  fields: () => ({
    id: { type: GraphQLID },
    color: { type: GraphQLString },
    typography: { type: Typography },
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
