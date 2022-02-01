import { describe, beforeAll, afterAll, it, expect } from '@jest/globals';
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

describe('markAsSeen as an active user', () => {
  it('Should mark story as seen', async () => {
    const [story] = await knex('story')
      .where('created_at', '>', moment().startOf('day').format('YYYY-MM-DD HH:mm:ss.SSS'))
      .whereNot('user_id', user.id)

    const res = await req.post('/graphql')
      .send({
        query: `
          mutation ($id: ID) {
            markAsSeen (
              story: {
                connect: {
                  id: $id
                }
              }
            ) {
              id
              seen
            }
          }
        `,
        variables: {
          id: story.id,
        }
      })
    
    expect(res.body).toHaveProperty('data.markAsSeen');

    const { markAsSeen } = res.body.data;

    expect(markAsSeen).toHaveProperty('seen', true);
  })
})

describe('markAsSeen as a banned user', () => {
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
    const [story] = await knex('story')
      .where('created_at', '>', moment().startOf('day').format('YYYY-MM-DD HH:mm:ss.SSS'))
      
    const res = await req.post('/graphql')
      .send({
        query: `
          mutation ($id: ID) {
            markAsSeen (
              story: {
                connect: {
                  id: $id
                }
              }
            ) {
              id
              seen
            }
          }
        `,
        variables: {
          id: story.id
        }
      });

    expect(res.body).toHaveProperty(['errors', '0', 'message']);
      
    const [{ message }] = res.body.errors;

    expect(message).toMatch(/You were banned from the platform/);
  })
})