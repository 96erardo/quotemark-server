import * as Knex from "knex";
import { v4 as uuid } from 'uuid';
import faker from 'faker';
import moment from 'moment';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('story').del();

    const quotes = await knex('quote').select('*').limit(80).orderBy('user_id');
    
    let stories = quotes.map(quote => ({
      id: uuid(),
      color: faker.internet.color(),
      content: quote.content,
      link: quote.link,
      quote_id: quote.id,
      user_id: quote.user_id,
      created_at: faker.datatype.boolean() ? (
        moment()
          .subtract(2, 'day')
          .format('YYYY-MM-DD HH:mm:ss.SSS')
      ) : (
        moment()
          .subtract(Math.random() * 12, 'hours')
          .subtract(Math.random() * 40, 'minutes')
          .subtract(Math.random() * 30, 'seconds')
          .format('YYYY-MM-DD HH:mm:ss.SSS')
      )
    }));

    // Inserts seed entries
    await knex('story').insert(stories);
};
