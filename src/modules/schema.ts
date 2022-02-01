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
  storiesList,
  storyCreate,
  storyDelete,
  myStoriesList,
  markAsSeen,
} from './story'
import {
  reportCreate,
  reportUpdate,
  reportsList
} from './report'

export default new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      user,
      usersList,
      quotesList,
      storiesList,
      myStoriesList,
      reportsList
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
      storyDelete,
      reportCreate,
      reportUpdate,
      markAsSeen,
    }
  })
})
