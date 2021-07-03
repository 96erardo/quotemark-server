import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { Server } from 'http';
import knex from '../../shared/knex';
import app from '../../../src/index';
import faker from 'faker';

let server: Server;
let req: request.SuperAgentTest;
let user: { id: string };
let stories: Array<string> = [];
let reports: Array<string> = [];

beforeAll((done) => {
  server = app.listen(4000, () => {
    req = request.agent(server);

    knex('user')
      .select('*')
      .where('email', process.env.GOOGLE_AUTH_USER_EMAIL)
      .limit(1)
      .then(result => {
        user = result[0];
        
        return knex('story')
          .select('*')
          .whereNot('user_id', user.id)
          .whereNull('deleted_at')
          .limit(5)
      })
      .then((result) => {
        stories = result.map(story => story.id);

        done && done();
      });
  });
});

afterAll((done) => {
  knex('report')
    .whereIn('id', reports)
    .del()
    .then(() =>
      server.close(() => done && done())
    )
})

describe('reportCreate as an active user', () => {
  afterAll((done) => {
    knex('story')
      .where('id', stories[0])
      .update({ deleted_at: null })
      .then(() => done && done())
  })

  it('Should be able to create a report', async () => {
    let reason = faker.lorem.sentence();

    const res = await req.post('/graphql')
      .send({
        query: `
          mutation ($data: ReportCreateInput!) {
            reportCreate (data: $data) {
              id
              reason
              status
              story {
                id
              }
              user {
                id
              }
            }
          }
        `,
        variables: {
          data: {
            story: { connect: { id: stories[0] } },
            reason: reason,
          }
        }
      });

    expect(res.body).toHaveProperty('data.reportCreate');

    expect(res.body.data.reportCreate).not.toBeNull();
    expect(res.body.data.reportCreate).toHaveProperty('reason', reason);
    expect(res.body.data.reportCreate).toHaveProperty('status', 'pending');
    expect(res.body.data.reportCreate).toHaveProperty('story.id', stories[0]);
    expect(res.body.data.reportCreate).toHaveProperty('user.id', user.id);

    reports.push(res.body.data.reportCreate.id);
  })

  it('Should fail when the story id does not exist', async () => {
    const res = await req.post('/graphql')
      .send({
        query: `
          mutation ($data: ReportCreateInput!) {
            reportCreate (data: $data) {
              id
              reason
              status
              story {
                id
              }
              user {
                id
              }
            }
          }
        `,
        variables: {
          data: {
            story: { connect: { id: 'fake-story-id' } },
            reason: faker.lorem.sentence(),
          }
        }
      });

    expect(res.body).toHaveProperty(['errors', '0', 'message']);
      
    const [{ message }] = res.body.errors;

    expect(message).toMatch(/The story you are trying to report doesn\'t exist/);
  })

  it('Should fail when the story is deleted', async () => {
    await knex('story')
      .where('id', stories[0])
      .update({ deleted_at: new Date() })

    const res = await req.post('/graphql')
      .send({
        query: `
          mutation ($data: ReportCreateInput!) {
            reportCreate (data: $data) {
              id
              reason
              status
              story {
                id
              }
              user {
                id
              }
            }
          }
        `,
        variables: {
          data: {
            story: { connect: { id: stories[0] } },
            reason: faker.lorem.sentence(),
          }
        }
      });

    expect(res.body).toHaveProperty(['errors', '0', 'message']);
      
    const [{ message }] = res.body.errors;

    expect(message).toMatch(/The story you are trying to report doesn\'t exist/);
  })

  it('Should fail when connection is missing', async () => {
    const res = await req.post('/graphql')
      .send({
        query: `
          mutation ($data: ReportCreateInput!) {
            reportCreate (data: $data) {
              id
              reason
              status
              story {
                id
              }
              user {
                id
              }
            }
          }
        `,
        variables: { 
          data: {
            reason: faker.lorem.sentence(),
          } 
        }
      });

    expect(res.body).toHaveProperty(['errors', '0', 'message']);
      
    const [{ message }] = res.body.errors;

    expect(message).toMatch(/Field "story" of required type "ReportStoryRelationInput!" was not provided/);
  });
})

describe('storyCreate as a banned user', () => {
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
          mutation ($data: ReportCreateInput!) {
            reportCreate (data: $data) {
              id
              reason
              status
              story {
                id
              }
              user {
                id
              }
            }
          }
        `,
        variables: {
          data: {
            story: { connect: { id: stories[0] } },
            reason: faker.lorem.sentence(),
          }
        }
      });

    expect(res.body).toHaveProperty(['errors', '0', 'message']);
      
    const [{ message }] = res.body.errors;

    expect(message).toMatch(/You were banned from the platform/);
  })
})