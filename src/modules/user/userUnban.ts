import { GraphQLFieldConfig, GraphQLNonNull, GraphQLID } from 'graphql'
import { Context } from '../../shared/types'
import { User } from './types'

export const userUnban: GraphQLFieldConfig<{}, Context> = {
  type: User,
  args: {
    id: { type: GraphQLNonNull(GraphQLID) }
  },
  resolve: async (_, { id }, { knex }) => {
    await knex('user')
      .where('id', id)
      .update({
        status: 'active'
      })

    const [result] = await knex('user')
      .select('*')
      .where('id', id)

    return result
  }
}
