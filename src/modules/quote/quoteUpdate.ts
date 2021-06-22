import {
  GraphQLFieldConfig,
  GraphQLNonNull,
  GraphQLID,
  GraphQLString
} from 'graphql'
import { Context } from '../../shared/types'
import { Quote } from './types'

export const quoteUpdate: GraphQLFieldConfig<{}, Context> = {
  type: Quote,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) }
  },
  resolve: async (_, { id, name }, { knex, user }) => {
    await knex('quote')
      .where('id', id)
      .where('user_id', user.id)
      .update({ name })

    const [result] = await knex('quote')
      .select('*')
      .where('id', id)
      .where('user_id', user.id)

    return result || null
  }
}
