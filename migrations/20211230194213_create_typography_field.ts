import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('story', (table) => {
    table.string('typography', 100)
      .notNullable()
      .defaultTo('Arial');
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('story', (table) => {
    table.dropColumn('typography');
  })
}
