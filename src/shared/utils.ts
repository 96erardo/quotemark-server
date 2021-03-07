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
 * Capitalizes the first letter of the specified text
 * 
 * @param text - The text string
 * 
 * @returns {string} The capitalized text
 */
export function capitalizeFirstLetter (text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}