import * as Knex from "knex";
import { v4 as uuid } from 'uuid';
import faker  from 'faker';
import { config } from 'dotenv';

config();

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('user').del();

  // Inserts seed entries
  await knex('user').insert([
    {
      id: 'test-example-id',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john_doe@example.com',
      avatar: 'https://learnyzen.com/wp-content/uploads/2017/08/test1.png',
      role: 'admin',
      status: 'active',
      created_at: new Date(),
      updated_at: new Date(),
    },
    { 
      id: uuid(), 
      first_name: faker.name.firstName(),
      last_name: faker.name.lastName(),
      email: faker.internet.email(),
      avatar: faker.image.avatar(),
      role: 'user',
      status: 'active',
      created_at: new Date(),
      updated_at: new Date(),
    },
    { 
      id: uuid(), 
      first_name: faker.name.firstName(),
      last_name: faker.name.lastName(),
      email: faker.internet.email(),
      avatar: faker.image.avatar(),
      role: 'user',
      status: 'active',
      created_at: new Date(),
      updated_at: new Date(),
    },
    { 
      id: uuid(), 
      first_name: faker.name.firstName(),
      last_name: faker.name.lastName(),
      email: faker.internet.email(),
      avatar: faker.image.avatar(),
      role: 'user',
      status: 'active',
      created_at: new Date(),
      updated_at: new Date(),
    }
  ]);
};
