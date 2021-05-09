import { GraphQLFieldConfig, GraphQLID, GraphQLNonNull } from 'graphql'
import { Context } from '../../shared/types'
import { User, RolesType } from './types'

export const userSetRole: GraphQLFieldConfig<{}, Context> = {
  type: User,
  args: {
    id: { type: GraphQLNonNull(GraphQLID) },
    role: { type: GraphQLNonNull(RolesType) }
  },
  resolve: async (_, { id, role }, { knex }) => {
    await knex('user')
      .where('id', id)
      .update({
        role: role
      })

    const [result] = await knex('user')
      .select('*')
      .where('id', id)

    console.log('result', result)

    return result
  }
}
