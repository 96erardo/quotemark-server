import { GraphQLFieldResolver } from 'graphql'
import { GraphQLError } from 'graphql/error'
import { Context, ErrorCodes } from '../types'
import { skip } from '../utils'

/**
 * Checks that the user currently authenticated is an admin
 *
 * @param parent - Data comming from parent resolvers
 * @param args - The arguments of the resolver
 * @param ctx - Context for the resolver
 *
 * @returns {void}
 */
export const isAdmin: GraphQLFieldResolver<{}, Context> = (parent, args, ctx) => {
  if (ctx.user.role !== 'admin') {
    throw new GraphQLError(
      'You don\'t have permissions to perform this operation',
      undefined, // nodes
      undefined, // stack
      undefined, // source
      undefined, // positions
      undefined, // originalError
      {
        code: ErrorCodes.NonAdmin
      }, // extensions
    )
  }

  return skip
}
