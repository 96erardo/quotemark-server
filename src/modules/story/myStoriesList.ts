// import { GraphQLFieldConfig, GraphQLInt, GraphQLObjectType } from 'graphql'
// import { Context } from '../../shared/types'
// import { combine } from '../../shared/utils'
// import { isActive } from '../../shared/middlewares/isActive'
import { List } from '../../shared/graphql-types'
// import { User } from '../user'
import { Story } from './types'

export const StoryListResponse = new List('StoryListResponse', Story)
