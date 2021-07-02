import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { Server } from 'http';
import knex from '../../shared/knex';
import app from '../../../src/index';

let server: Server;
let req: request.SuperAgentTest;
let user: { id: string };

beforeAll((done) => {
  server = app.listen(4000, () => {
    req = request.agent(server);

    knex('user')
      .select('*')
      .where('email', process.env.GOOGLE_AUTH_USER_EMAIL)
      .limit(1)
      .then(result => {
        user = result[0];
        
        done && done();
      })
  });
});

afterAll((done) => {
  server.close(() => done && done())
})

describe('storiesList as an active user', () => {
  it('Should return the users that has stories', async () => {
    const res = await req.post('/graphql')
      .send({
        query: `
          query ($first: Int, $skip: Int) {
            storiesList (first: $first, skip: $skip) {
              count
              items {
                id
                stories {
                  count
                }
              }
            }
          }
        `,
        variables: { }
      })

    expect(res.body).toHaveProperty('data.storiesList');

    expect(res.body.data.storiesList).not.toBeNull();
    expect(res.body.data.storiesList.count).toBe(3);
    expect(res.body.data.storiesList.items).toHaveLength(3);

    const { items } = res.body.data.storiesList;

    for (const user of items) {
      expect(user.stories.count).toBeGreaterThan(0);
    }
  })

  it('Should return only the first user', async () => {
    const res = await req.post('/graphql')
      .send({
        query: `
          query ($first: Int, $skip: Int) {
            storiesList (first: $first, skip: $skip) {
              count
              items {
                id
              }
            }
          }
        `,
        variables: {
          first: 1,
        }
      })

    expect(res.body).toHaveProperty('data.storiesList');

    expect(res.body.data.storiesList).not.toBeNull();
    expect(res.body.data.storiesList.count).toBe(3);
    expect(res.body.data.storiesList.items).toHaveLength(1);
  })

  it('Should return user after the first one', async () => {
    const res = await req.post('/graphql')
      .send({
        query: `
          query ($first: Int, $skip: Int) {
            storiesList (first: $first, skip: $skip) {
              count
              items {
                id
              }
            }
          }
        `,
        variables: {
          first: 1,
          skip: 1,
        }
      })

    expect(res.body).toHaveProperty('data.storiesList');

    expect(res.body.data.storiesList).not.toBeNull();
    expect(res.body.data.storiesList.count).toBe(3);
    expect(res.body.data.storiesList.items).toHaveLength(1);
  })

  it('Should return only the last user', async () => {
    const res = await req.post('/graphql')
      .send({
        query: `
          query ($first: Int, $skip: Int) {
            storiesList (first: $first, skip: $skip) {
              count
              items {
                id
              }
            }
          }
        `,
        variables: {
          skip: 2,
        }
      })

    expect(res.body).toHaveProperty('data.storiesList');

    expect(res.body.data.storiesList).not.toBeNull();
    expect(res.body.data.storiesList.count).toBe(3);
    expect(res.body.data.storiesList.items).toHaveLength(1);
  })
})

describe('storiesList as a banned user', () => {
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
          query ($first: Int, $skip: Int) {
            storiesList (first: $first, skip: $skip) {
              count
              items {
                id
              }
            }
          }
        `,
        variables: { }
      });

    expect(res.body).toHaveProperty(['errors', '0', 'message']);
      
    const [{ message }] = res.body.errors;

    expect(message).toMatch(/You were banned from the platform/);
  })
})