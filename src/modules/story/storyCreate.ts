import { GraphQLFieldConfig, GraphQLInputObjectType, GraphQLNonNull, GraphQLString } from 'graphql';
import { Context } from '../../shared/types';
import { QuoteKeyFilter } from '../quote/types';
import { Story } from './types';
import { combine } from '../../shared/utils';
import { isActive } from '../../shared/middlewares/isActive';
import { v4 as uuid } from 'uuid';

const StoryQuoteRelationInput = new GraphQLInputObjectType({
  name: 'StoryQuoteRelationInput',
  fields: () => ({
    connect: {
      type: QuoteKeyFilter,
    }
  })
})

export const storyCreate: GraphQLFieldConfig<{}, Context> = {
  type: Story,
  args: {
    quote: {
      type: new GraphQLNonNull(StoryQuoteRelationInput),
    },
    color: {
      type: GraphQLString,
      defaultValue: "#e10098"
    }
  },
  resolve: combine(
    isActive,
    async (_, args, { knex, user }) => {
      const { quote: { connect }, color } = args;
  
      const [quote] = await knex('quote')
        .select('*')
        .where('id', connect.id)
        .where('user_id', user.id)
  
      if (!quote) {
        throw new Error('The quote you are trying to link does not exist')
      }
  
      const id = uuid();
  
      await knex('story')
        .insert({
          id,
          color,
          content: quote.content,
          link: quote.link,
          quote_id: connect.id,
          user_id: user.id,
        })
  
      const [story] = await knex('story').select('*').where('id', id).limit(1);
  
      return story;
    }
  )
  
}