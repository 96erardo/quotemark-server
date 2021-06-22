import { GraphQLFieldConfig, GraphQLInputObjectType, GraphQLString, GraphQLNonNull } from 'graphql'
import { Quote } from './types'
import { Context } from '../../shared/types'
import { v4 as uuid } from 'uuid'

const QuoteCreateInput = new GraphQLInputObjectType({
  name: 'QuoteCreateInput',
  fields: {
    name: { type: GraphQLString },
    content: { type: new GraphQLNonNull(GraphQLString) },
    link: { type: new GraphQLNonNull(GraphQLString) }
  }
})

export const quoteCreate: GraphQLFieldConfig<{}, Context> = {
  type: Quote,
  args: {
    data: { type: QuoteCreateInput }
  },
  resolve: async (_, { data }, { knex, user }) => {
    const id = uuid()

    await knex('quote')
      .insert({
        id,
        name: data.name,
        content: data.content,
        link: data.link,
        user_id: user.id
      })

    const [quote] = await knex.select().from('quote').where({ id }).limit(1)

    return quote
  }
}
