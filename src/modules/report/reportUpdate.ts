import {
  GraphQLFieldConfig,
  GraphQLNonNull,
  GraphQLID,
  GraphQLString
} from 'graphql'
import { Context } from '../../shared/types'
import { Report } from './types'
import { isActive } from '../../shared/middlewares/isActive'
import { isAdmin } from '../../shared/middlewares/isAdmin'
import { combine } from '../../shared/utils'

export const reportUpdate: GraphQLFieldConfig<{}, Context> = {
  type: Report,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    status: { type: new GraphQLNonNull(GraphQLString) }
  },
  resolve: combine(
    isActive,
    isAdmin,
    async (_, { id, status }, { knex }) => {
      if (
        status !== 'pending' &&
        status !== 'approved' &&
        status !== 'rejected'
      ) {
        throw new Error('The status is invalid, please choose one of "pending", "approved" or "rejected"')
      }

      await knex('report')
        .where('id', id)
        .whereNull('deleted_at')
        .update({ status })

      const [report] = await knex('report')
        .select('*')
        .where('id', id)
        .whereNull('deleted_at')

      if (!report) {
        throw new Error('The report you are trying to update does not exist')
      }

      return report
    }
  )
}
