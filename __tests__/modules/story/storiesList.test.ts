import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { Server } from 'http';
import { user } from '../../shared/data';
import knex from '../../shared/knex';
import app from '../../../src/index';

let server: Server;
let req: request.SuperAgentTest;

beforeAll((done) => {
  server = app.listen(4000, () => {
    req = request.agent(server);

    done && done();
  });
});

afterAll((done) => {
  server.close(() => done && done())
})

describe('storiesList as an active user', () => {
  it('Should return list of stories', async () => {
    const res = await req.post('/graphql')
      .send({
        query: `
          query ($first: Int, $skip: Int) {
            storiesList (first: $first, skip: $skip) {
              count
              items {
                id
                user {
                  id
                }
              }
            }
          }
        `,
        variables: { first: 10 },
      })

    expect(res.body).toHaveProperty('data.storiesList');

    expect(res.body.data.storiesList).not.toBeNull();
    expect(res.body.data.storiesList.count).toBeGreaterThan(0);

    const { items } = res.body.data.storiesList;

    for (const story of items) {
      expect(story.user.id).not.toBe(user.id);
    }
  })

  it('Should return only the first 10 stories', async () => {
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
          first: 10,
        }
      })

    expect(res.body).toHaveProperty('data.storiesList');

    expect(res.body.data.storiesList).not.toBeNull();
    expect(res.body.data.storiesList.items).toHaveLength(10);
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