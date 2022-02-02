import { GraphQLFieldResolver } from 'graphql'
import { GraphQLError } from 'graphql/error';
import { Context, ErrorCodes } from '../types'
import { skip } from '../utils'

/**
 * Checks that the user currently authenticated is an not banned from the platform
 *
 * @param parent - Data comming from parent resolvers
 * @param args - The arguments of the resolver
 * @param ctx - Context for the resolver
 *
 * @returns {void}
 */
export const isMyStory: GraphQLFieldResolver<{}, Context> = async (_, { id }, { user, knex }) => {
  let story = null;

  try {
    const result = await knex('story')
      .select('id')
      .where('id', id)
      .where('user_id', user.id)

    story = result[0];

  } catch (e) {
    throw new GraphQLError(
      'Something happened, please try again.',
      undefined, // nodes
      undefined, // stack
      undefined, // source
      undefined, // positions
      undefined, // originalError
      {
        code: ErrorCodes.ServerException
      }, // extensions
    );
  }

  if (!story) {
    throw new GraphQLError(
      'You are not authorized to perform this action',
      undefined, // nodes
      undefined, // stack
      undefined, // source
      undefined, // positions
      undefined, // originalError
      {
        code: ErrorCodes.NonOwner
      }, // extensions
    );  
  }

  return skip;
}
