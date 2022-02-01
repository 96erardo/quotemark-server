import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt,
  GraphQLFieldConfig,
  GraphQLObjectType,
} from 'graphql'
import { User } from '../user/types'
import { combine } from '../../shared/utils'
import { Context, ServerError } from '../../shared/types'
import { isActive } from '../../shared/middlewares/isActive'
import { isMyStory } from '../../shared/middlewares/isMyStory'
import { QueryBuilder } from 'knex'

export const StoryViewsResponse = new GraphQLObjectType<{ query: QueryBuilder }, Context>({
  name: 'StoryViewsResponse',
  fields: () => ({
    count: {
      type: GraphQLNonNull(GraphQLInt),
      resolve: async ({ query }) => {
        try {
          const [{ count }] = await query
            .clone()
            .clear('select')
            .clear('limit')
            .clear('offset')
            .count({ count: 'user_id' })

          return count

        } catch (e) {
          throw new ServerError(e.message)
        }
      }
    },
    items: {
      type: GraphQLNonNull(new GraphQLList(User)),
      resolve: async ({ query }) => {
        try {
          return await query
            .clone()
            .clear('select')
            .select('user.*')
            .innerJoin('user', 'user_views_story.user_id', 'user.id')

        } catch (e) {
          throw new ServerError(e.message)
        }
      }
    }
  })
}) 

export const viewsList: GraphQLFieldConfig<{}, Context> = {
  type: GraphQLNonNull(StoryViewsResponse),
  args: {
    id: { type: GraphQLNonNull(GraphQLID) },
    first: { type: GraphQLInt },
    skip: { type: GraphQLInt }
  },
  resolve: combine(
    isActive,
    isMyStory,
    async (_, { id, first, skip }, { knex }) => {
      const query = knex('user_views_story')

      query.where('story_id', id)

      if (first) { query.limit(first) }

      if (skip) { query.offset(skip) }

      return { query }
    }
  )
}
