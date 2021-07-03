import { GraphQLFieldConfig, GraphQLInputObjectType, GraphQLNonNull, GraphQLString } from 'graphql'
import { Context } from '../../shared/types'
import { RelationConnect } from '../../shared/graphql-types'
import { StoryKeyFilter } from '../story/types'
import { isActive } from '../../shared/middlewares/isActive'
import { combine } from '../../shared/utils'
import { v4 as uuid } from 'uuid'
import { Report } from './types'

const ReportCreateInput = new GraphQLInputObjectType({
  name: 'ReportCreateInput',
  fields: () => ({
    reason: { type: new GraphQLNonNull(GraphQLString) },
    story: { type: new GraphQLNonNull(new RelationConnect('ReportStoryRelationInput', StoryKeyFilter)) }
  })
})

export const reportCreate: GraphQLFieldConfig<{}, Context> = {
  type: Report,
  args: {
    data: { type: new GraphQLNonNull(ReportCreateInput) }
  },
  resolve: combine(
    isActive,
    async (_, { data }, { knex, user }) => {
      const [story] = await knex('story')
        .select('id')
        .where('id', data.story.connect.id)
        .whereNull('deleted_at')
        .limit(1)

      if (!story) {
        throw new Error('The story you are trying to report doesn\'t exist')
      }

      const id = uuid()

      await knex('report')
        .insert({
          id,
          reason: data.reason,
          status: 'pending',
          story_id: data.story.connect.id,
          user_id: user.id
        })

      const [report] = await knex('report')
        .select('*')
        .where('id', id)
        .limit(1)

      return report
    }
  )
}
