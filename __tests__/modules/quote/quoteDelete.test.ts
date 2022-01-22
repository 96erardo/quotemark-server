import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { Server } from 'http';
import knex from '../../shared/knex';
import { user } from '../../shared/data';
import app from '../../../src/index';
import faker  from 'faker';
import { v4 as uuid } from 'uuid';

let server: Server;
let req: request.SuperAgentTest;
let id: string = '';

beforeAll((done) => {
  server = app.listen(4000, () => {
    req = request.agent(server);

    id = uuid();

    knex('quote')
      .insert({
        id,
        name: faker.name.title(),
        content: faker.lorem.sentence(),
        link: faker.internet.url(),
        user_id: user.id,
      })
      .then(() => done && done())
  });
});

afterAll((done) => {
  knex('quote')
    .where('id', id)
    .del()
    .then(() =>  server.close(() => done && done()))
})

describe('quoteDelete as an active user', () => {
  afterAll((done) => {
    knex('quote')
      .where('id', id)
      .update({ user_id: user.id })
      .then(() => done && done())
  })

  it('Should delete successfully', async () => {
    const res = await req.post('/graphql')
      .send({
        query: `
          mutation ($id: ID!) {
            quoteDelete (id: $id) {
              success
              message
            }
          }
        `,
        variables: {
          id,
        }
      })

    expect(res.body).toHaveProperty('data.quoteDelete');

    const { data: { quoteDelete } } = res.body;

    expect(quoteDelete.success).toBeTruthy();
  })

  it('Should not find the quote', async () => {
    const res = await req.post('/graphql')
      .send({
        query: `
          mutation ($id: ID!) {
            quoteDelete (id: $id) {
              success
              message
            }
          }
        `,
        variables: {
          id,
        }
      })

    expect(res.body).toHaveProperty('data.quoteDelete');

    const { data: { quoteDelete } } = res.body;

    expect(quoteDelete.success).toBeFalsy();
    expect(quoteDelete.message).toBe('The quote you are trying to delete does not exist');
  })

  it('Should deny access to others quotes', async () => {
    const [ other ] = await knex('user')
      .select('*')
      .whereNot('email', process.env.GOOGLE_AUTH_USER_EMAIL)
      .limit(1);
    
    await knex('quote')
      .where('id', id)
      .update({ user_id: other.id, deleted_at: null })


    const res = await req.post('/graphql')
      .send({
        query: `
          mutation ($id: ID!) {
            quoteDelete (id: $id) {
              success
              message
            }
          }
        `,
        variables: {
          id,
        }
      })
    
    expect(res.body).toHaveProperty('data.quoteDelete');

    const { data: { quoteDelete } } = res.body;
    
    expect(quoteDelete.success).toBeFalsy();
    expect(quoteDelete.message).toBe('You don\'t have permission to perform this operation');
  })
})

describe('quoteDelete as a banned user', () => {
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
    const res = await req.post('/graphql')
      .send({
        query: `
          mutation ($id: ID!) {
            quoteDelete (id: $id) {
              success
              message
            }
          }
        `,
        variables: {
          id,
        }
      })

    expect(res.body).toHaveProperty(['errors', '0', 'message']);
    
    const [{ message }] = res.body.errors;

    expect(message).toMatch(/You were banned from the platform/);
  })
})