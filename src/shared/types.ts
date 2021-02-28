import { GraphQLInt, GraphQLList, GraphQLObjectType } from 'graphql';
import Knex from 'knex';

export type Context = {
  knex: Knex
}

export class List extends GraphQLObjectType {
  constructor (name: string, type: GraphQLObjectType) {
    super({
      name,
      fields: {
        count: { type: GraphQLInt },
        items: { type: new GraphQLList(type) }
      }
    });
  }
}