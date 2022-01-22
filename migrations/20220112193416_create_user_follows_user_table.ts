import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('user_follows_user', (table) => {
    table.string('user_id').notNullable();
    table.string('following_id').notNullable();

    table.primary(['user_id', 'following_id']);

    table.foreign('user_id').references('user.id')
      .onUpdate('RESTRICT')
      .onDelete('CASCADE');

    table.foreign('following_id').references('user.id')
      .onUpdate('RESTRICT')
      .onDelete('CASCADE');
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('user_follows_user');
}

