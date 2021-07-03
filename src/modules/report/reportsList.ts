import {
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLFieldConfig
} from 'graphql'
import { IDPredicate, StringPredicate, DateTimePredicate, List } from '../../shared/graphql-types'
import { Report, ReportType } from './types'
import { createFilter, combine } from '../../shared/utils'
import { Context, ListArguments } from '../../shared/types'
import { isActive } from '../../shared/middlewares/isActive'
import { isAdmin } from '../../shared/middlewares/isAdmin'

export const ReportListResponse = new List('ReportListResponse', Report)

const ReportFilter: GraphQLInputObjectType = new GraphQLInputObjectType({
  name: 'ReportFilter',
  fields: () => ({
    id: { type: IDPredicate },
    reason: { type: StringPredicate },
    status: { type: StringPredicate },
    createdAt: { type: DateTimePredicate },
    updatedAt: { type: DateTimePredicate },
    OR: { type: new GraphQLList(new GraphQLNonNull(ReportFilter)) },
    AND: { type: new GraphQLList(new GraphQLNonNull(ReportFilter)) }
  })
})

export const reportsList: GraphQLFieldConfig<{}, Context, ListArguments<ReportType>> = {
  type: ReportListResponse,
  args: {
    filter: { type: ReportFilter },
    first: { type: GraphQLInt },
    skip: { type: GraphQLInt }
  },
  resolve: combine(
    isActive,
    isAdmin,
    async (_, { first, skip, filter }, { knex }) => {
      const query = knex('report')

      query.whereNull('deleted_at')

      if (filter) { createFilter(query, filter) }

      if (first) { query.limit(first) }

      if (skip) { query.offset(skip) }

      return { query }
    }
  )
}
