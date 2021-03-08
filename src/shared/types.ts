import Knex from 'knex';

export type Context = {
  knex: Knex
}

export type ListArguments<T> = {
  first?: number,
  skip?: number,
  filter?: Filter<Partial<T>>
}

export type Filter<T> = {
  [key in keyof T]: Partial<{
    equals: Value,
    not_equals: Value,
    in: Array<Value>,
    not_in: Array<Value>,
    contains: Value,
    starts_with: Value,
    not_starts_with: Value,
    ends_with: Value,
    not_ends_with: Value,
    OR: Array<Filter<T>>,
    AND: Array<Filter<T>>,
  }>
}

export type Value = string | number | boolean;