import { GraphQLFieldConfig, GraphQLID, GraphQLNonNull } from 'graphql'
import { Context } from '../../shared/types'
import { combine } from '../../shared/utils'
import { isActive } from '../../shared/middlewares/isActive'
import { isAdmin } from '../../shared/middlewares/isAdmin'
import { User, RolesType } from './types'

export const userSetRole: GraphQLFieldConfig<{}, Context> = {
  type: User,
  args: {
    id: { type: GraphQLNonNull(GraphQLID) },
    role: { type: GraphQLNonNull(RolesType) }
  },
  resolve: combine(
    isActive,
    isAdmin,
    async (_, { id, role }, { knex }) => {
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
  )
}
