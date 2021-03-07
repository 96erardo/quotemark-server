import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('user', (table) => {
    table.string('id').primary();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.date('birth_date').notNullable();
    table.string('email').notNullable();
    table.string('password').notNullable();
    table.timestamps(false, true);
    table.dateTime('deleted_at').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('user');
}
