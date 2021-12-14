import {
  GraphQLFieldConfig,
  GraphQLInt,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLList
} from 'graphql'
import { User, UserType } from './types'
import { Context, ListArguments } from '../../shared/types'
import { createFilter } from '../../shared/utils'
import {
  List,
  IDPredicate,
  StringPredicate,
  DatePredicate,
  DateTimePredicate
} from '../../shared/graphql-types'

const UserListResponse = new List('UserListResponse', User)

export const UserFilter: GraphQLInputObjectType = new GraphQLInputObjectType({
  name: 'UserFilter',
  fields: () => ({
    id: { type: IDPredicate },
    firstName: { type: StringPredicate },
    lastName: { type: StringPredicate },
    email: { type: StringPredicate },
    birthDate: { type: DatePredicate },
    createdAt: { type: DateTimePredicate },
    updatedAt: { type: DateTimePredicate },
    deletedAt: { type: DateTimePredicate },
    OR: { type: new GraphQLList(new GraphQLNonNull(UserFilter)) },
    AND: { type: new GraphQLList(new GraphQLNonNull(UserFilter)) }
  })
})

export const usersList: GraphQLFieldConfig<{}, Context, ListArguments<UserType>> = {
  type: GraphQLNonNull(UserListResponse),
  args: {
    filter: { type: UserFilter },
    first: { type: GraphQLInt },
    skip: { type: GraphQLInt }
  },
  resolve: (_, { first, skip, ...rest }, { knex }) => {
    const query = knex('user')

    if (rest.filter) { createFilter(query, rest.filter) }

    if (first) { query.limit(first) }

    if (skip) { query.offset(skip) }

    return { query }
  }
}
