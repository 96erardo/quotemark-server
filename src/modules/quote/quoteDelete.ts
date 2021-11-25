import { GraphQLFieldConfig, GraphQLID, GraphQLNonNull } from 'graphql'
import { Context } from '../../shared/types'
import { DeleteResult } from '../../shared/graphql-types'
import { isActive } from '../../shared/middlewares/isActive'
import { combine } from '../../shared/utils'

export const quoteDelete: GraphQLFieldConfig<{}, Context> = {
  type: GraphQLNonNull(DeleteResult),
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) }
  },
  resolve: combine(
    isActive,
    async (_, { id }, { knex, user }) => {
      const [quote] = await knex('quote')
        .select('*')
        .where('id', id)
        .whereNull('deleted_at')
        .limit(1)

      if (!quote) {
        return {
          success: false,
          message: 'The quote you are trying to delete does not exist'
        }
      }

      if (quote.userId !== user.id) {
        return {
          success: false,
          message: 'You don\'t have permission to perform this operation'
        }
      }

      await knex('quote')
        .where('id', id)
        .where('user_id', user.id)
        .update({
          deleted_at: new Date()
        })

      return {
        success: true
      }
    }
  )
}
