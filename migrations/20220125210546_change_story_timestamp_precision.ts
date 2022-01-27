import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('story', (table) => {
    table
      .dateTime('created_at', { precision: 3 })
      .notNullable()
      .defaultTo(knex.fn.now(3))
      .alter()
    
    table
      .dateTime('updated_at', { precision: 3 })
      .notNullable()
      .defaultTo(knex.fn.now(3))
      .alter()
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('story', (table) => {
    table
      .dateTime('created_at')
      .notNullable()
      .defaultTo(knex.fn.now())
      .alter()
    
    table
      .dateTime('updated_at')
      .notNullable()
      .defaultTo(knex.fn.now())
      .alter()
  })
}

