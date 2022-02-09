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

describe('myStoriesList as an active user', () => {
  it('Should return the user\'s stories', async () => {
    const res = await req.post('/graphql')
      .send({
        query: `
          query {
            myStoriesList {
              count
              items {
                id
                user {
                  id
                }
                deletedAt
              }
            }
          }
        `,
        variables: { }
      })

    expect(res.body).toHaveProperty('data.myStoriesList');

    expect(res.body.data.myStoriesList).not.toBeNull();
    expect(res.body.data.myStoriesList.count).toBeGreaterThan(0);

    const { items } = res.body.data.myStoriesList;

    const aDayAgo = moment().subtract(1, 'day');

    for (const story of items) {
      expect(story.user.id).toBe(user.id);
      expect(story.deletedAt).toBe(null);
      expect(
        moment(story.createdAt).isAfter(aDayAgo)
      ).toBeTruthy()
    }
  })

  it('Should return only 5 stories', async () => {
    const res = await req.post('/graphql')
      .send({
        query: `
          query ($first: Int, $skip: Int) {
            myStoriesList (first: $first, skip: $skip) {
              count
              items {
                id
              }
            }
          }
        `,
        variables: {
          first: 5,
        }
      })

    expect(res.body).toHaveProperty('data.myStoriesList');

    expect(res.body.data.myStoriesList).not.toBeNull();
    expect(res.body.data.myStoriesList.items.length).toBeLessThanOrEqual(5);
  })

  it('Should return only stories with https links', async () => {
    const res = await req.post('/graphql')
      .send({
        query: `
          query ($filter: MyStoryFilter) {
            myStoriesList (filter: $filter) {
              count
              items {
                id
                link
              }
            }
          }
        `,
        variables: {
          filter: {
            link: {
              starts_with: 'https'
            }
          }
        }
      })

    expect(res.body).toHaveProperty('data.myStoriesList');
    expect(res.body.data.myStoriesList).not.toBeNull();

    const { items } = res.body.data.myStoriesList;

    for (const story of items) {
      expect(story.link).toMatch(/^https/)
    }
  })
})

describe('myStoriesList as a banned user', () => {
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
          query {
            myStoriesList {
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