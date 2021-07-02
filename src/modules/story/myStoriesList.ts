import {
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLFieldConfig
} from 'graphql'
import { IDPredicate, StringPredicate, List } from '../../shared/graphql-types'
import { Story, StoryType } from './types'
import { createFilter, combine } from '../../shared/utils'
import { Context, ListArguments } from '../../shared/types'
import { isActive } from '../../shared/middlewares/isActive'
import moment from 'moment'

export const StoryListResponse = new List('StoryListResponse', Story)

const StoryFilter: GraphQLInputObjectType = new GraphQLInputObjectType({
  name: 'StoryFilter',
  fields: () => ({
    id: { type: IDPredicate },
    color: { type: StringPredicate },
    content: { type: StringPredicate },
    link: { type: StringPredicate },
    OR: { type: new GraphQLList(new GraphQLNonNull(StoryFilter)) },
    AND: { type: new GraphQLList(new GraphQLNonNull(StoryFilter)) }
  })
})

export const myStoriesList: GraphQLFieldConfig<{}, Context, ListArguments<StoryType>> = {
  type: StoryListResponse,
  args: {
    filter: { type: StoryFilter },
    first: { type: GraphQLInt },
    skip: { type: GraphQLInt }
  },
  resolve: combine(
    isActive,
    async (_, { first, skip, filter }, { knex, user }) => {
      const query = knex('story')

      query.where('user_id', user.id)
      query.where('created_at', '>', moment().subtract(1, 'day').toISOString())
      query.whereNull('deleted_at')

      if (filter) { createFilter(query, filter) }

      if (first) { query.limit(first) }

      if (skip) { query.offset(skip) }

      return { query }
    }
  )
}
