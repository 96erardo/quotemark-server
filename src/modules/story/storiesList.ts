import { 
  GraphQLFieldConfig, 
  GraphQLInputObjectType, 
  GraphQLInt, 
  GraphQLList, 
  GraphQLNonNull 
} from 'graphql'
import { 
  List, 
  IDPredicate, 
  StringPredicate, 
} from '../../shared/graphql-types';
import { Context } from '../../shared/types'
import { combine, createFilter } from '../../shared/utils'
import { isActive } from '../../shared/middlewares/isActive'
import { Story } from './types';
import moment from 'moment'

const StoryListResponse = new List('StoryListResponse', Story);

const StoryFilter: GraphQLInputObjectType = new GraphQLInputObjectType({
  name: 'StoryFilter',
  fields: () => ({
    id: { type: IDPredicate },
    name: { type: StringPredicate },
    content: { type: StringPredicate },
    link: { type: StringPredicate },
    OR: { type: new GraphQLList(new GraphQLNonNull(StoryFilter)) },
    AND: { type: new GraphQLList(new GraphQLNonNull(StoryFilter)) }
  })
})

export const storiesList: GraphQLFieldConfig<{}, Context> = {
  type: GraphQLNonNull(StoryListResponse),
  args: {
    filter: { type: StoryFilter },
    first: { type: GraphQLInt },
    skip: { type: GraphQLInt }
  },
  resolve: combine(
    isActive,
    async (_, { filter, first, skip }, { knex, user }) => {
      const query = knex('story');

      query.whereNot('user_id', user.id);
      query.where('created_at', '>', moment().subtract(1, 'day').toISOString());
      query.whereNull('deleted_at');

      if (filter) { createFilter(query, filter) }

      if (first) { query.limit(first) }

      if (skip) { query.offset(skip) }

      return { query }
    }
  )
}
