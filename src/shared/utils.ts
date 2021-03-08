import { QueryBuilder } from "knex";
import { Filter } from "./types";


export function convertToCamel (row: Record<string, any>) {
  return Object.keys(row).reduce((acum, key) => ({
    ...acum,
    [toCamel(key)]: row[key],
  }), {});
}

/**
 * Returns a camelCase string from a snake_case
 * 
 * @param field - The database field to format
 * 
 * @returns {string} The formatted field
 */
export function toCamel (field: string) {
  const parts = field.split('_');

  return parts[0] + parts.slice(1).map(capitalizeFirstLetter).join('');
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
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function createFilter<T>(builder: QueryBuilder, filter: Filter<T>): QueryBuilder {
  let query = builder.clone();

  for (const field in filter) {
    const attr = toSnake(field)

    if (!Array.isArray(filter[field])) {
      for (const method in filter[field]) {
        
        switch (method) {
          case 'equals':
            query = query.where(attr, filter[field].equals);
            break;
          case 'not_equals':
            query = query.whereNot(attr, filter[field].not_equals);
            break;
          case 'in':
            query = query.whereIn(attr, filter[field].in || []);
            break;
          case 'not_in':
            query = query.whereNotIn(attr, filter[field].not_in || []);
            break;
          case 'contains':
            query = query.where(attr, 'like', `%${filter[field].contains}%`);
            break;
          case 'starts_with':
            query = query.where(attr, 'like', `${filter[field].starts_with}%`);
            break;
          case 'ends_with':
            query = query.where(attr, 'like', `%${filter[field].not_starts_with}`);
            break;
        }
      }
    }
  }

  return query;
}