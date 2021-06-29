import { GraphQLObjectType, GraphQLSchema } from 'graphql'
import {
  user,
  usersList,
  userUpdate,
  userBan,
  userUnban,
  userSetRole
} from './user'
import {
  quoteUpdate,
  quoteCreate,
  quoteDelete,
  quotesList
} from './quote'
import {
  storyCreate
} from './story';

export default new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      user,
      usersList,
      quotesList
      // bookmark,
      // bookmarksList
    }
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      userUpdate,
      userBan,
      userUnban,
      userSetRole,
      quoteUpdate,
      quoteCreate,
      quoteDelete,
      storyCreate,
    }
  })
})
