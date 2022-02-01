import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('user_views_story', (table) => {
    table.string('user_id').notNullable();
    table.string('story_id').notNullable();

    table.primary(['user_id', 'story_id']);

    table.foreign('user_id').references('user.id')
      .onUpdate('RESTRICT')
      .onDelete('CASCADE');

    table.foreign('story_id').references('story.id')
      .onUpdate('RESTRICT')
      .onDelete('CASCADE');
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('user_views_story');
}

