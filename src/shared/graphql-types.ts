import { GraphQLID, GraphQLInt, GraphQLList, GraphQLInputObjectType, GraphQLNonNull, GraphQLObjectType, GraphQLString, GraphQLScalarType, GraphQLBoolean } from 'graphql'
import { QueryBuilder } from 'knex'
import { Context } from './types'

export class List extends GraphQLObjectType<{ query: QueryBuilder }, Context> {
  constructor (name: string, type: GraphQLObjectType) {
    super({
      name,
      fields: {
        count: {
          type: GraphQLInt,
          resolve: async ({ query }) => {
            const [{ count }] = await query
              .clone()
              .clear('select')
              .clear('limit')
              .clear('offset')
              .count({ count: 'id' })

            return count
          }
        },
        items: {
          type: new GraphQLList(type),
          resolve: async ({ query }) => await query.clone().select('*')
        }
      }
    })
  }
}

export const GraphQLDate = new GraphQLScalarType({
  name: 'Date',
  serialize: (value: Date) => {
    const year = value.getFullYear()
    const month = value.getMonth() < 9 ? `0${value.getMonth() + 1}` : `${value.getMonth() + 1}`
    const day = value.getDate() < 10 ? `0${value.getDate()}` : `${value.getDate()}`

    return `${year}-${month}-${day}`
  },
  parseValue: (value: string) => {
    const date = value.trim()

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Date should have YYYY-MM-DD format')
    }

    return date
  },
  description: 'A date string in YYYY-MM-DD format'
})

export const GraphQLDateTime = new GraphQLScalarType({
  name: 'DateTime',
  serialize: (date: Date) => date.toISOString(),
  parseValue: (value: string) => {
    const date = value.trim()

    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3,6}Z$/.test(date)) {
      throw new Error('Date time should have ISO 8601 format')
    }

    return date.replace('T', ' ').replace('Z', '')
  },
  description: 'A DateTime string in ISO 8601 format'
})

export const IDPredicate = new GraphQLInputObjectType({
  name: 'IDPredicate',
  fields: {
    equals: { type: GraphQLID },
    not_equals: { type: GraphQLID },
    in: { type: new GraphQLList(new GraphQLNonNull(GraphQLID)) },
    not_in: { type: new GraphQLList(new GraphQLNonNull(GraphQLID)) },
    contains: { type: GraphQLID },
    starts_with: { type: GraphQLID },
    not_starts_with: { type: GraphQLID },
    ends_with: { type: GraphQLID },
    not_ends_with: { type: GraphQLID }
  }
})

export const IntPredicate = new GraphQLInputObjectType({
  name: 'IntPredicate',
  fields: {
    equals: { type: GraphQLInt },
    not_equals: { type: GraphQLInt },
    in: { type: new GraphQLList(new GraphQLNonNull(GraphQLInt)) },
    not_in: { type: new GraphQLList(new GraphQLNonNull(GraphQLInt)) },
    lt: { type: GraphQLInt },
    lte: { type: GraphQLInt },
    gt: { type: GraphQLInt },
    gte: { type: GraphQLInt }
  }
})

export const StringPredicate = new GraphQLInputObjectType({
  name: 'StringPredicate',
  fields: {
    equals: { type: GraphQLString },
    not_equals: { type: GraphQLString },
    in: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
    not_in: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
    contains: { type: GraphQLString },
    starts_with: { type: GraphQLString },
    not_starts_with: { type: GraphQLString },
    ends_with: { type: GraphQLString },
    not_ends_with: { type: GraphQLString }
  }
})

export const DatePredicate = new GraphQLInputObjectType({
  name: 'DatePredicate',
  fields: {
    equals: { type: GraphQLDate },
    not_equals: { type: GraphQLDate },
    in: { type: new GraphQLList(new GraphQLNonNull(GraphQLDate)) },
    not_in: { type: new GraphQLList(new GraphQLNonNull(GraphQLDate)) },
    lt: { type: GraphQLDate },
    lte: { type: GraphQLDate },
    gt: { type: GraphQLDate },
    gte: { type: GraphQLDate },
    is_empty: { type: GraphQLBoolean },
    is_not_empty: { type: GraphQLBoolean }
  }
})

export const DateTimePredicate = new GraphQLInputObjectType({
  name: 'DateTimePredicate',
  fields: {
    equals: { type: GraphQLDateTime },
    not_equals: { type: GraphQLDateTime },
    in: { type: new GraphQLList(new GraphQLNonNull(GraphQLDateTime)) },
    not_in: { type: new GraphQLList(new GraphQLNonNull(GraphQLDateTime)) },
    lt: { type: GraphQLDate },
    lte: { type: GraphQLDate },
    gt: { type: GraphQLDate },
    gte: { type: GraphQLDate },
    is_empty: { type: GraphQLBoolean },
    is_not_empty: { type: GraphQLBoolean }
  }
})
