import * as Knex from "knex";
import { v4 as uuid } from 'uuid';
import faker  from 'faker';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('quote').del();

  const users = await knex('user').select('*');
  const quotes = [];

  for (const user of users) {

    for (let i = 0; i < 20; i++) {
      quotes.push({
        id: uuid(),
        name: faker.name.title(),
        content: faker.lorem.sentence(),
        link: faker.internet.url(),
        user_id: user.id,
      })
    }
  }

  await knex('quote').insert(quotes);
};
