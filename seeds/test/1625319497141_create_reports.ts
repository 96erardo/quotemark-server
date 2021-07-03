import * as Knex from "knex";
import { v4 as uuid } from 'uuid';
import faker from 'faker';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('report').del();

    const users = await knex('user').select('*');

    const stories = await knex('story').select('*');

    const reports = [];

    for (let i = 0; i < 40; i++) {
      const id = uuid();
      const storie = faker.random.arrayElement(stories);
      const user = users.find(user => user.id !== storie.userId);

      reports.push({
        id,
        reason: faker.lorem.sentence(),
        status: faker.random.arrayElement(['pending', 'rejected', 'approved']),
        story_id: storie.id,
        user_id: user.id,
        deleted_at: faker.datatype.boolean() ? null : new Date(),
      })
    }

    // Inserts seed entries
    await knex("report").insert(reports);
};
