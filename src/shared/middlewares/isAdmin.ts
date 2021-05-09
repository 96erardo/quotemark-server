import { skip } from 'graphql-resolvers'
import { GraphQLFieldResolver } from 'graphql'
import { Context } from '../types'

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
    throw new Error('You don\'t have permissions to perform this operation')
  }

  return skip
}
