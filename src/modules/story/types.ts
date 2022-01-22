import { 
  GraphQLObjectType, 
  GraphQLID, 
  GraphQLString, 
  GraphQLInputObjectType,
  GraphQLEnumType,
  GraphQLNonNull,
} from 'graphql'
import { GraphQLDateTime } from '../../shared/graphql-types'
import knex from '../../shared/configuration/knex';
import { User } from '../user'

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
        const [user] = await knex('user')
          .where('id', data.userId)
          .limit(1);

        return user;
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
