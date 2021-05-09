import { GraphQLFieldConfig, GraphQLID, GraphQLNonNull } from 'graphql'
import { Context } from '../../shared/types'
import { User } from './types'

export const userBan: GraphQLFieldConfig<{}, Context> = {
  type: User,
  args: {
    id: { type: GraphQLNonNull(GraphQLID) }
  },
  resolve: async (_, { id }, { knex }) => {
    await knex('user')
      .where('id', id)
      .update({
        status: 'banned'
      })

    const [result] = await knex('user')
      .select('*')
      .where('id', id)

    return result
  }
}
