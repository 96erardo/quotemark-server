import { GraphQLFieldConfig, GraphQLID, GraphQLNonNull } from 'graphql'
import { Context } from '../../shared/types'
import { DeleteResult } from '../../shared/graphql-types'
import { isActive } from '../../shared/middlewares/isActive'
import { combine } from '../../shared/utils'

export const storyDelete: GraphQLFieldConfig<{}, Context> = {
  type: GraphQLNonNull(DeleteResult),
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) }
  },
  resolve: combine(
    isActive,
    async (_, { id }, { knex, user }) => {
      const [story] = await knex('story')
        .select('*')
        .where('id', id)
        .whereNull('deleted_at')
        .limit(1)

      if (!story) {
        return {
          success: false,
          message: 'The story you are trying to delete does not exist'
        }
      }

      if (story.userId !== user.id) {
        return {
          success: false,
          message: 'You don\'t have permission to perform this operation'
        }
      }

      try {
        await knex('story')
          .where('id', id)
          .where('user_id', user.id)
          .update({
            deleted_at: new Date()
          })
      } catch (e) {
        return {
          success: false,
          message: e.message
        }
      }

      return {
        success: true
      }
    }
  )
}
