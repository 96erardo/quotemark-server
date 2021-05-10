import {
  GraphQLInputObjectType,
  GraphQLFieldConfig,
  GraphQLString,
  GraphQLNonNull
} from 'graphql'
import { User } from './types'
import { Context } from '../../shared/types'
import { combine } from '../../shared/utils'
import { isActive } from '../../shared/middlewares/isActive'

const UserUpdateInput = new GraphQLInputObjectType({
  name: 'UserUpdateInput',
  fields: {
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString }
  }
})

export const userUpdate: GraphQLFieldConfig<{}, Context> = {
  type: User,
  args: {
    data: { type: GraphQLNonNull(UserUpdateInput) }
  },
  resolve: combine(
    isActive,
    async (_, { data }, { knex, user }) => {
      await knex('user')
        .where('id', user.id)
        .update({
          first_name: data.firstName || user.firstName,
          last_name: data.lastName || user.lastName
        })

      const [result] = await knex('user')
        .select('*')
        .where('id', user.id)

      return result
    }
  )
}
