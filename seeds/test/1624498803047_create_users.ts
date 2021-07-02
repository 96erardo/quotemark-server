import * as Knex from "knex";
import { v4 as uuid } from 'uuid';
import faker  from 'faker';
import { config } from 'dotenv';
import { google } from 'googleapis';

config();

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('user').del();

  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_AUTH_CLIENT_ID,
    process.env.GOOGLE_AUTH_CLIENT_SECRET
  );

  oAuth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_AUTH_REFRESH_TOKEN
  });

  const { token } = await oAuth2Client.getAccessToken();

  const api = google.people({
    version: 'v1',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const { data } = await api.people.get({
    personFields: 'names,birthdays,emailAddresses,photos,metadata',
    resourceName: 'people/me'
  });

  const [profile] = data.metadata?.sources || [];
  const [names] = data.names || [];
  const [photo] = data.photos || [];
  const [email] = data.emailAddresses || [];

  // Inserts seed entries
  await knex('user').insert([
    {
      id: profile.id,
      first_name: names.givenName,
      last_name: names.familyName,
      email: email.value,
      avatar: photo.url,
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
