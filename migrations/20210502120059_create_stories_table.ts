import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('story', (table) => {
    table.string('id').primary();
    table.string('color', 45).notNullable();
    table.text('content').notNullable();
    table.string('link', 2048).notNullable();
    table.string('quote_id').notNullable();
    table.timestamps(false, true);
    table.dateTime('deleted_at').nullable();

    table.foreign('quote_id').references('quote.id')
      .onUpdate('RESTRICT')
      .onDelete('CASCADE')
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('story');
}

