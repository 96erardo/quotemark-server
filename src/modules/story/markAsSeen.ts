import {
  GraphQLFieldConfig,
  GraphQLNonNull,
  GraphQLInputObjectType
} from 'graphql';
import { Context, ServerError } from '../../shared/types';
import { isActive } from '../../shared/middlewares/isActive';
import { combine } from '../../shared/utils';
import { Story, StoryKeyFilter } from './types';

const StoryViewRelationInput = new GraphQLInputObjectType({
  name: 'StoryViewRelationInput',
  fields: () => ({
    connect: {
      type: StoryKeyFilter
    }
  })
})

export const markAsSeen: GraphQLFieldConfig<{}, Context> = {
  type: GraphQLNonNull(Story),
  args: {
    story: {
      type: GraphQLNonNull(StoryViewRelationInput)
    }
  },
  resolve: combine(
    isActive,
    async (_, args, { knex, user }) => {
      const { story: { connect } } = args;
  
      try {
        const [existent] = await knex('user_views_story')
          .select('*')
          .where('story_id', connect.id)
          .where('user_id', user.id)

        const [story] = await knex('story')
          .select('*')
          .where('id', connect.id)

        if (existent) {
          return {
            ...story,
            seen: user.id,
          };
        }

        await knex('user_views_story')
          .insert({
            story_id: connect.id,
            user_id: user.id
          })

        return {
          ...story,
          seen: user.id,
        };

      } catch (e) {
        throw new ServerError(e);
      }
    }
  )  
}