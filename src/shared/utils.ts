import { QueryBuilder } from 'knex'
import { Filter } from './types'
import { GraphQLFieldResolver } from 'graphql'

export function convertToCamel (row: Record<string, any>) {
  return Object.keys(row).reduce((acum, key) => ({
    ...acum,
    [toCamel(key)]: row[key]
  }), {})
}

/**
 * Returns a camelCase string from a snake_case
 *
 * @param field - The database field to format
 *
 * @returns {string} The formatted field
 */
export function toCamel (field: string) {
  const parts = field.split('_')

  return parts[0] + parts.slice(1).map(capitalizeFirstLetter).join('')
}

/**
 * Returns a snake_case string from a camelCase
 *
 * @param {string} field - The field to format
 *
 * @returns {string} The formatted field
 */
export function toSnake (field: string) {
  return field.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

/**
 * Capitalizes the first letter of the specified text
 *
 * @param text - The text string
 *
 * @returns {string} The capitalized text
 */
export function capitalizeFirstLetter (text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Appends filters to the query builder based on the data passed
 *
 * @param query - The query builder object with a table already selected
 * @param filter - The filter data
 *
 * @returns {void}
 */
export function createFilter<T> (query: QueryBuilder, filter: Filter<T>): void {
  for (const field in filter) {
    const attr = toSnake(field)

    if (!Array.isArray(filter[field])) {
      for (const method in filter[field]) {
        switch (method) {
          case 'equals':
            query.where(attr, filter[field].equals)
            break
          case 'not_equals':
            query.whereNot(attr, filter[field].not_equals)
            break
          case 'in':
            query.whereIn(attr, filter[field].in || [])
            break
          case 'lt':
            query.where(attr, '<', filter[field].lt || '')
            break
          case 'lte':
            query.where(attr, '<=', filter[field].lte || '')
            break
          case 'gt':
            query.where(attr, '>', filter[field].gt || '')
            break
          case 'gte':
            query.where(attr, '>=', filter[field].gte || '')
            break
          case 'not_in':
            query.whereNotIn(attr, filter[field].not_in || [])
            break
          case 'contains':
            query.where(attr, 'like', `%${filter[field].contains}%`)
            break
          case 'starts_with':
            query.where(attr, 'like', `${filter[field].starts_with}%`)
            break
          case 'not_starts_with':
            query.where(attr, 'not like', `${filter[field].not_starts_with}%`)
            break
          case 'ends_with':
            query.where(attr, 'like', `%${filter[field].ends_with}`)
            break
          case 'not_ends_with':
            query.where(attr, 'not like', `%${filter[field].not_ends_with}`)
            break
        }
      }
    } else {
      if (field === 'OR') {
        query.where(and => (filter[field] as Array<Filter<T>>)
          .forEach(f => and.orWhere(or => createFilter(or, f))))
      } else if (field === 'AND') {
        query.where(builder => (filter[field] as Array<Filter<T>>)
          .forEach(f => builder.where(and => createFilter(and, f))))
      }
    }
  }
}

export const skip: undefined = undefined

/**
 * Left-first composition for methods of any type.
 *
 * @param funcs - resolver implementations.
 *
 * @return The combined functions.
 */
export function combine<
  S,
  C,
  A = Record<string, any>
> (...funcs: Array<GraphQLFieldResolver<S, C, A>>): GraphQLFieldResolver<S, C, A> {
  return (...args) => funcs.reduce(
    (prevPromise, resolver) =>
      prevPromise.then(prev => (prev === skip ? resolver(...args) : prev)),
    Promise.resolve()
  )
};
