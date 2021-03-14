import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('bookmark', (table) => {
    table.string('id').primary();
    table.string('name');
    table.text('content').notNullable();
    table.string('link', 2048).notNullable();
    table.string('user_id').notNullable();
    table.timestamps(false, true);
    table.dateTime('deleted_at').nullable();

    table.foreign('user_id').references('user.id')
      .onUpdate('RESTRICT')
      .onDelete('CASCADE')
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('bookmark');
}
