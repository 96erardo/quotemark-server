import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { Server } from 'http';
import { user } from '../../shared/data';
import knex from '../../shared/knex';
import app from '../../../src/index';
import moment from 'moment';

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
  afterAll((done) => {
    knex('user_views_story')
      .where('user_id', '=', user.id)
      .delete()
      .then(() => done && done())
  })
  
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

  it('Should return only the first 10 stories ordered by creation date', async () => {
    const res = await req.post('/graphql')
      .send({
        query: `
          query ($first: Int, $skip: Int) {
            storiesList (first: $first, skip: $skip) {
              count
              items {
                id
                createdAt
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

    const { items } = res.body.data.storiesList;
    let after = items[0].createdAt;

    for (let i = 1; i < items.length; i++) {
      const before = moment(items[i].createdAt);

      expect(
        moment(after).isAfter(before)
      ).toBeTruthy()

      after = items[i].createdAt;
    }

    const stories = items.slice(0, 6);

    await knex('user_views_story').insert(stories.map((story: Record<string, string>) => ({
      user_id: user.id,
      story_id: story.id
    })))
  })

  it('Should return not seen stories first', async () => {
    const res = await req.post('/graphql')
      .send({
        query: `
          query ($first: Int, $skip: Int) {
            storiesList (first: $first, skip: $skip) {
              count
              items {
                id
                seen
              }
            }
          }
        `,
        variables: {
          first: 10,
        }
      })

    expect(res.body).toHaveProperty('data.storiesList');

    const { items } = res.body.data.storiesList;

    for (let i = 0; i < 6; i++) {
      const { [i]: story } = items;
      
      expect(story.seen).toBeFalsy();
    }
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