import { GraphQLInputObjectType, GraphQLList, GraphQLString, GraphQLNonNull } from 'graphql';
import { IDPredicate, StringPredicate, DateTimePredicate } from '../../shared/graphql-types';

export const BookmarkCreateInput = new GraphQLInputObjectType({
  name: 'BookmarkCreateInput',
  fields: {
    name: { type: GraphQLString },
    content: { type: new GraphQLNonNull(GraphQLString) },
    link: { type: new GraphQLNonNull(GraphQLString) },
    user: {
      type: new GraphQLNonNull(new GraphQLInputObjectType({
        name: 'UserRelationInput',
        fields: {
          connect: {
            type: new GraphQLInputObjectType({
              name: 'UserKeyFilter',
              fields: {
                id: {
                  type: GraphQLString
                }
              }
            })
          }
        }
      }))
    }
  }
});

export const BookmarkFilter: GraphQLInputObjectType = new GraphQLInputObjectType({
  name: 'BookmarkFilter',
  fields: () => ({
    id: { type: IDPredicate },
    name: { type: StringPredicate },
    content: { type: StringPredicate },
    link: { type: StringPredicate },
    createdAt: { type: DateTimePredicate },
    updatedAt: { type: DateTimePredicate },
    deletedAt: { type: DateTimePredicate },
    OR: { type: new GraphQLList(new GraphQLNonNull(BookmarkFilter)) },
    AND: { type: new GraphQLList(new GraphQLNonNull(BookmarkFilter)) },
  })
})