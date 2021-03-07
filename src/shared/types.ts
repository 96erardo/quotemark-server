import { GraphQLID, GraphQLInt, GraphQLList, GraphQLInputObjectType, GraphQLNonNull, GraphQLObjectType, GraphQLString, GraphQLScalarType } from 'graphql';
import Knex from 'knex';

export type Context = {
  knex: Knex
}

export class List extends GraphQLObjectType {
  constructor (name: string, type: GraphQLObjectType) {
    super({
      name,
      fields: {
        count: {
          type: GraphQLInt,
          resolve: (source) => source.count
        },
        items: {
          type: new GraphQLList(type) 
        }
      }
    });
  }
}

export const GraphQLDate = new GraphQLScalarType({
  name: 'Date',
  serialize: (value: Date) => {
    const year = value.getFullYear();
    const month = value.getMonth() < 9 ? `0${value.getMonth() + 1}` : `${value.getMonth() + 1}`;
    const day = value.getDate() < 10 ? `0${value.getDate()}` : `${value.getDate()}`;

    return `${year}-${month}-${day}`;
  },
  parseValue: (value: string) => {
    const date = value.trim();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Date should have YYYY-MM-DD format');
    }

    return date;
  },
  description: 'A date string in YYYY-MM-DD format'
});

export const GraphQLDateTime = new GraphQLScalarType({
  name: 'DateTime',
  serialize: (date: Date) => date.toISOString(),
  parseValue: (value: string) => {
    const date = value.trim();

    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3,6}Z$/.test(date)) {
      throw new Error('Date time should have ISO 8601 format');
    }

    return date.replace('T', ' ').replace('Z', '');
  },
  description: 'A DateTime string in ISO 8601 format'
});

export const IDPredicate = new GraphQLInputObjectType({
  name: 'IDPredicate',
  fields: {
    equals: {
      type: GraphQLID
    },
    not_equals: {
      type: GraphQLID
    },
    in: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLID))
    },
    not_in: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLID))
    },
    contains: {
      type: GraphQLID
    },
    starts_with: {
      type: GraphQLID
    },
    not_starts_with: {
      type: GraphQLID
    },
    ends_with: {
      type: GraphQLID
    },
    not_ends_with: {
      type: GraphQLID
    },
  }
});

export const StringPredicate = new GraphQLInputObjectType({
  name: 'StringPredicate',
  fields: {
    equals: {
      type: GraphQLString
    },
    not_equals: {
      type: GraphQLString
    },
    in: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLString))
    },
    not_in: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLString))
    },
    contains: {
      type: GraphQLString
    },
    starts_with: {
      type: GraphQLString
    },
    not_starts_with: {
      type: GraphQLString
    },
    ends_with: {
      type: GraphQLString
    },
    not_ends_with: {
      type: GraphQLString
    },
  }
});