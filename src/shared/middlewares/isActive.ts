import { GraphQLFieldResolver } from 'graphql'
import { skip } from '../utils'
import { Context } from '../types'

/**
 * Checks that the user currently authenticated is an not banned from the platform
 *
 * @param parent - Data comming from parent resolvers
 * @param args - The arguments of the resolver
 * @param ctx - Context for the resolver
 *
 * @returns {void}
 */
export const isActive: GraphQLFieldResolver<{}, Context> = (parent, args, ctx) => {
  if (ctx.user.status === 'banned') {
    throw new Error(
      'You were banned from the platform, ' +
      'you don\'t have permissions to perform this operation'
    )
  }

  return skip
}
