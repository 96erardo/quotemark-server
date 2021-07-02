import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { Server } from 'http';
import knex from '../../shared/knex';
import app from '../../../src/index';
import faker  from 'faker';
import { v4 as uuid } from 'uuid';

let server: Server;
let req: request.SuperAgentTest;
let user: { id: string };
let id: string = '';

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
      .then(([ quote ]) => {
        id = uuid();

        return knex('story')
          .insert({
            id,
            color: faker.internet.color(),
            content: quote.content,
            link: quote.link,
            quote_id: quote.id,
            user_id: quote.userId,
          })
      })
      .catch((e) => console.error('asdasldknasl', e.message))
      .finally(() => done && done());
  });
});

afterAll((done) => {
  knex('story').where('id', id).del()
    .then(() =>  server.close(() => done && done()))
})

describe('storyDelete as an active user', () => {
  afterAll((done) => {
    knex('story')
      .where('id', id)
      .update({ user_id: user.id })
      .then(() => done && done())
  })

  it('Should delete successfully', async () => {
    const res = await req.post('/graphql')
      .send({
        query: `
          mutation ($id: ID!) {
            storyDelete (id: $id) {
              success
              message
            }
          }
        `,
        variables: {
          id,
        }
      })

    expect(res.body).toHaveProperty('data.storyDelete');

    const { data: { storyDelete } } = res.body;

    expect(storyDelete.success).toBeTruthy();
  })

  it('Should not find the story', async () => {
    const res = await req.post('/graphql')
      .send({
        query: `
          mutation ($id: ID!) {
            storyDelete (id: $id) {
              success
              message
            }
          }
        `,
        variables: {
          id,
        }
      })

    expect(res.body).toHaveProperty('data.storyDelete');

    const { data: { storyDelete } } = res.body;

    expect(storyDelete.success).toBeFalsy();
    expect(storyDelete.message).toBe('The story you are trying to delete does not exist');
  })

  it('Should deny access to others stories', async () => {
    const [ other ] = await knex('user')
      .select('*')
      .whereNot('email', process.env.GOOGLE_AUTH_USER_EMAIL)
      .limit(1);
    
    await knex('story')
      .where('id', id)
      .update({ user_id: other.id, deleted_at: null })


    const res = await req.post('/graphql')
      .send({
        query: `
          mutation ($id: ID!) {
            storyDelete (id: $id) {
              success
              message
            }
          }
        `,
        variables: {
          id,
        }
      })
    
    expect(res.body).toHaveProperty('data.storyDelete');

    const { data: { storyDelete } } = res.body;
    
    expect(storyDelete.success).toBeFalsy();
    expect(storyDelete.message).toBe('You don\'t have permission to perform this operation');
  })
})

describe('storyDelete as a banned user', () => {
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
            storyDelete (id: $id) {
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