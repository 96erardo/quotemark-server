import { GraphQLFieldConfig, GraphQLInt, GraphQLList, GraphQLObjectType } from 'graphql'
import { Context } from '../../shared/types'
import { combine } from '../../shared/utils'
import { isActive } from '../../shared/middlewares/isActive'
import { User } from '../user'
import moment from 'moment'
import Knex from 'knex'

const UsersStoryListResponse = new GraphQLObjectType<{ first: number, skip: number }, Context>({
  name: 'UsersStoryListResponse',
  fields: () => ({
    count: {
      type: GraphQLInt,
      resolve: async (_, args, { knex }) => {
        const result = await knex('story').countDistinct('user_id')

        const [{ 'count(distinct `userId`)': count }] = result

        return count
      }
    },
    items: {
      type: GraphQLList(User),
      resolve: async ({ first, skip }, args, { knex }) => {
        const query = knex
          .select('*')
          .from(function (this: Knex) {
            this.select(
              'user.id',
              'user.first_name',
              'user.last_name',
              'user.avatar'
            )
              .count('story.id', { as: 'count' })
              .from('story')
              .where('story.created_at', '>', moment().subtract(1, 'day').toISOString())
              .whereNull('story.deleted_at')
              .innerJoin('user', 'story.user_id', 'user.id')
              .groupBy('story.user_id')
              .as('users')
          })

        if (first) {
          query.limit(first)
        }

        if (skip) {
          query.offset(skip)
        };

        const users = await query

        return users.map(user => ({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          stories: {
            count: user.count
          }
        }))
      }
    }
  })
})

export const storiesList: GraphQLFieldConfig<{}, Context> = {
  type: UsersStoryListResponse,
  args: {
    first: { type: GraphQLInt },
    skip: { type: GraphQLInt }
  },
  resolve: combine(
    isActive,
    async (_, args, { knex }) => {
      return args
    }
  )
}
