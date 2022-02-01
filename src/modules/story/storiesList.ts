import { 
  GraphQLObjectType,
  GraphQLFieldConfig, 
  GraphQLInputObjectType, 
  GraphQLInt, 
  GraphQLList, 
  GraphQLNonNull 
} from 'graphql'
import { 
  IDPredicate, 
  StringPredicate,
  DateTimePredicate,
} from '../../shared/graphql-types';
import { Context, ServerError } from '../../shared/types'
import { combine, createFilter } from '../../shared/utils'
import { isActive } from '../../shared/middlewares/isActive'
import { Story } from './types';
import { QueryBuilder } from 'knex';
import moment from 'moment'

const StoryListResponse = new GraphQLObjectType<{ query: QueryBuilder }, Context>({
  name: 'StoryListResponse',
  fields: {
    count: {
      type: GraphQLNonNull(GraphQLInt),
      resolve: async ({ query }) => {
        try {
          const [{ count }] = await query
            .clone()
            .clear('select')
            .clear('limit')
            .clear('offset')
            .count({ count: 'id' })

          return count

        } catch (e) {
          throw new ServerError(e.message)
        }
      }
    },
    items: {
      type: GraphQLNonNull(new GraphQLList(GraphQLNonNull(Story))),
      resolve: async ({ query }, _, { knex, user }) => {
        try {
          return await query
            .clone()
            .clear('select')
            .clear('order')
            .select('story.*', 'view.user_id as seen')
            .leftJoin('user_views_story as view', function () {
              this.on('story.id', '=', 'view.story_id')
                .andOn('view.user_id', '=', knex.raw(':user_id', { user_id: user.id }))
            })
            .orderBy('view.user_id', 'asc')
            .orderBy('created_at', 'desc')
          
        } catch (e) {
          throw new ServerError(e.message);
        }
      }
    }
  }
})

const StoryFilter: GraphQLInputObjectType = new GraphQLInputObjectType({
  name: 'StoryFilter',
  fields: () => ({
    id: { type: IDPredicate },
    name: { type: StringPredicate },
    content: { type: StringPredicate },
    link: { type: StringPredicate },
    createdAt: { type: DateTimePredicate },
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
      query.select('story.*', 'seen.user_id as seen')

      query.whereNot('story.user_id', user.id);
      query.where('created_at', '>', moment().subtract(1, 'day').toISOString());
      query.whereNull('deleted_at');

      if (filter) { createFilter(query, filter) }

      if (first) { query.limit(first) }

      if (skip) { query.offset(skip) }

      return { query }
    }
  )
}
