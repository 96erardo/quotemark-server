import {
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt,
  GraphQLFieldConfig,
  GraphQLObjectType,
} from 'graphql'
import { IDPredicate, StringPredicate, List } from '../../shared/graphql-types'
import { User, UserType } from '../user/types'
import { createFilter, combine } from '../../shared/utils'
import { Context, ListArguments, ServerError } from '../../shared/types'
import { isActive } from '../../shared/middlewares/isActive'
import { QueryBuilder } from 'knex'
import moment from 'moment'

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
    async (_, { id, first, skip }, { knex }) => {
      const query = knex('user_views_story')

      query.where('story_id', id)

      if (first) { query.limit(first) }

      if (skip) { query.offset(skip) }

      return { query }
    }
  )
}
