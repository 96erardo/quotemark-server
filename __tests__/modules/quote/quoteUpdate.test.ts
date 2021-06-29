import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { Server } from 'http';
import knex from '../../shared/knex';
import app from '../../../src/index';
import faker  from 'faker';

let server: Server;
let req: request.SuperAgentTest;
let user: { id: string };
let ownedQuote: { id: string };
let otherQuote: { id: string };

beforeAll((done) => {
  server = app.listen(4000, () => {
    req = request.agent(server);

    knex('user')
      .select('*')
      .where('email', process.env.GOOGLE_AUTH_USER_EMAIL)
      .limit(1)
      .then(result => {
        user = result[0];

        return knex('quote')
          .select('*')
          .where('user_id', user.id)
          .limit(1)
      })
      .then((result) => {
        ownedQuote = result[0];

        return knex('quote')
          .select('*')
          .whereNot('user_id', user.id)
          .limit(1)
      })
      .then((result) => {
        otherQuote = result[0];

        if (done) {
          done();
        }
      });
  });
});

afterAll((done) => {
  server.close(() => done && done())
})

describe('quoteUpdate as an active user', () => {
  it('Should be able to update a quote\'s name', async () => {
    let name = faker.lorem.sentence();

    let res = await req.post('/graphql')
      .send({
        query: `
          mutation ($id: ID!, $name: String!) {
            quoteUpdate (id: $id, name: $name) {
              id
              name
              user {
                id
              }
            }
          }
        `,
        variables: {
          id: ownedQuote.id,
          name: name,
        }
      });

    expect(res.body).toHaveProperty('data.quoteUpdate');

    expect(res.body.data.quoteUpdate).not.toBeNull();
    expect(res.body.data.quoteUpdate).toHaveProperty('name', name);
  })

  it('Should return null when trying to update other\'s quote', async () => {
    let res = await req.post('/graphql')
      .send({
        query: `
          mutation ($id: ID!, $name: String!) {
            quoteUpdate (id: $id, name: $name) {
              id
              name
            }
          }
        `,
        variables: {
          id: otherQuote.id,
          name: faker.lorem.sentence()
        }
      })

    expect(res.body).toHaveProperty('data.quoteUpdate');

    expect(res.body.data.quoteUpdate).toBeNull();
  })
})

describe('quoteUpdate as a banned user', () => {
  beforeAll((done) => {
    knex('user')
      .where('id', user.id)
      .update({ status: 'banned' })
      .then(() => done && done())
  })

  afterAll((done) => {
    knex('user')
      .where('id', user.id)
      .update({ status: 'active' })
      .then(() => done && done())
  })

  it('Should deny access when user is banned', async () => {
    const response = await req.post('/graphql')
      .send({
        query: `
          mutation ($id: ID!, $name: String!) {
            quoteUpdate (id: $id, name: $name) {
              id
              name
            }
          }
        `,
        variables: {
          id: ownedQuote.id,
          name: 'Quote #5',
        }
      });

    expect(response.body).toHaveProperty(['errors', '0', 'message']);
      
    const [{ message }] = response.body.errors;

    expect(message).toMatch(/You were banned from the platform/);
  })
})