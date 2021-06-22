import {
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLFieldConfig
} from 'graphql'
import { IDPredicate, StringPredicate, DateTimePredicate, List } from '../../shared/graphql-types'
import { Quote, QuoteType } from './types'

import { createFilter } from '../../shared/utils'
import { Context, ListArguments } from '../../shared/types'

export const QuoteListResponse = new List('QuoteListResponse', Quote)

const QuoteFilter: GraphQLInputObjectType = new GraphQLInputObjectType({
  name: 'QuoteFilter',
  fields: () => ({
    id: { type: IDPredicate },
    name: { type: StringPredicate },
    content: { type: StringPredicate },
    link: { type: StringPredicate },
    createdAt: { type: DateTimePredicate },
    updatedAt: { type: DateTimePredicate },
    deletedAt: { type: DateTimePredicate },
    OR: { type: new GraphQLList(new GraphQLNonNull(QuoteFilter)) },
    AND: { type: new GraphQLList(new GraphQLNonNull(QuoteFilter)) }
  })
})

export const quotesList: GraphQLFieldConfig<{}, Context, ListArguments<QuoteType>> = {
  type: QuoteListResponse,
  args: {
    filter: { type: QuoteFilter },
    first: { type: GraphQLInt },
    skip: { type: GraphQLInt }
  },
  resolve: async (_, { first, skip, filter }, { knex, user }) => {
    const query = knex('quote')

    query.where('user_id', user.id)

    if (filter) { createFilter(query, filter) }

    if (first) { query.limit(first) }

    if (skip) { query.offset(skip) }

    return { query }
  }
}
