import { GraphQLFieldConfig, GraphQLNonNull, GraphQLID } from 'graphql'
import { Context } from '../../shared/types'
import { combine } from '../../shared/utils'
import { isActive } from '../../shared/middlewares/isActive'
import { isAdmin } from '../../shared/middlewares/isAdmin'
import { User } from './types'

export const userUnban: GraphQLFieldConfig<{}, Context> = {
  type: User,
  args: {
    id: { type: GraphQLNonNull(GraphQLID) }
  },
  resolve: combine(
    isActive,
    isAdmin,
    async (_, { id }, { knex }) => {
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
  )
}
