import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('report', (table) => {
    table.string('id').primary();
    table.string('reason', 400).notNullable();
    table.enum('status', ['pending', 'rejected', 'approved']);
    table.string('story_id').notNullable();
    table.string('user_id').notNullable();
    table.timestamps(false, true);
    table.dateTime('deleted_at').nullable();

    table.foreign('story_id').references('story.id')
      .onUpdate('RESTRICT')
      .onDelete('CASCADE');

    table.foreign('user_id').references('user.id')
      .onUpdate('RESTRICT')
      .onDelete('CASCADE');
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('report');
}

