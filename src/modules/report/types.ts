import { GraphQLID, GraphQLObjectType, GraphQLString, GraphQLEnumType } from 'graphql'
import { GraphQLDateTime } from '../../shared/graphql-types'
import { Context } from '../../shared/types'
import { Story } from '../story/types'
import { User } from '../user/types'
import { user } from '../user/user'

export const ReportStatus = new GraphQLEnumType({
  name: 'ReportStatus',
  values: {
    pending: { value: 'pending' },
    rejected: { value: 'rejected' },
    approved: { value: 'approved' }
  }
})

export const Report = new GraphQLObjectType<any, Context>({
  name: 'Report',
  fields: () => ({
    id: { type: GraphQLID },
    reason: { type: GraphQLString },
    status: { type: ReportStatus },
    story: {
      type: Story,
      resolve: async (data, _, { knex }) => {
        const [story] = await knex('story').where('id', data.storyId).limit(1)

        return story || null
      }
    },
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
