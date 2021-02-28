import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('bookmark', (table) => {
    table.increments('id');
    table.text('content').notNullable();
    table.integer('user_id').unsigned().notNullable();
    table.timestamps();
    table.dateTime('deleted_at').nullable();
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('bookmark');
}
