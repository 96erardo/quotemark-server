import { GraphQLFieldConfig, GraphQLNonNull } from 'graphql'
import { Context } from '../../shared/types'
import { User } from './types'

export const user: GraphQLFieldConfig<{}, Context> = {
  type: GraphQLNonNull(User),
  resolve: async (_, args, { user }) => user
}
