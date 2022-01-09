import { GraphQLFieldResolver } from 'graphql'
import { GraphQLError } from 'graphql/error';
import { skip } from '../utils'
import { Context, ErrorCodes } from '../types'

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
    throw new GraphQLError(
        'You were banned from the platform, ' +
        'you don\'t have permissions to perform this operation',
        undefined, // nodes
        undefined, // stack
        undefined, // source
        undefined, // positions
        undefined, // originalError
        {
          code: ErrorCodes.NonActive
        }, // extensions
    );
  }

  return skip
}
