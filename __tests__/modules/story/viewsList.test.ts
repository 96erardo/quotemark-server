import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { Server } from 'http';
import { user } from '../../shared/data';
import knex from '../../shared/knex';
import app from '../../../src/index';

let server: Server;
let req: request.SuperAgentTest;
let story: { id: string };
let stories: Array<{ id: string }>;
let users: Array<{ id: string }>;

beforeAll((done) => {
  server = app.listen(4000, () => {
    req = request.agent(server);

    Promise.all([
      knex('user').whereNot('id', user.id),
      knex('story').where('user_id', user.id),
      knex('story').whereNot('user_id', user.id).limit(1)
    ])
    .then(([ otherUsers, myStories, otherStory ]) => {
      stories = myStories;
      story = otherStory[0];
      users = otherUsers;

      const views = users.map(user => ({
        story_id: stories[0].id,
        user_id: user.id,
      }))

      return knex('user_views_story')
        .insert(views)
    })
    .then(() => done && done())
  });
});

afterAll((done) => {
  server.close(() => {
    knex('user_views_story')
      .where('story_id', stories[0].id)
      .delete()
      .then(() => done && done())
  })
})

describe('viewsList as an active user', () => {  
  it('Should return list of views', async () => {
    const res = await req.post('/graphql')
      .send({
        query: `
          query ($id: ID!) {
            viewsList (id: $id) {
              count
              items {
                id
              }
            }
          }
        `,
        variables: { id: stories[0].id },
      })

    expect(res.body).toHaveProperty('data.viewsList');

    expect(res.body.data.viewsList).not.toBeNull();
    expect(res.body.data.viewsList.count).toBe(3);

    const { items } = res.body.data.viewsList;

    for (const u of items) {
      expect(users.map(({ id }) => id)).toContain(u.id)
    }
  })

  it('Should deny access on views on other user story', async () => {
    const res = await req.post('/graphql')
      .send({
        query: `
          query ($id: ID!) {
            viewsList (id: $id) {
              count
              items {
                id
              }
            }
          }
        `,
        variables: { id: story.id },
      })
    
    expect(res.body).toHaveProperty(['errors', '0', 'message']);
    
    const [{ message }] = res.body.errors;

    expect(message).toMatch(/You are not authorized to perform this action/);
  })
})

describe('viewsList as a banned user', () => {
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
          query ($id: ID!) {
            viewsList (id: $id) {
              count
            }
          }
        `,
        variables: {
          id: stories[0].id
        }
      });

    expect(res.body).toHaveProperty(['errors', '0', 'message']);
      
    const [{ message }] = res.body.errors;

    expect(message).toMatch(/You were banned from the platform/);
  })
})