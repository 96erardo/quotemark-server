import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { Server } from 'http';
import knex from '../../shared/knex';
import app from '../../../src/index';

let server: Server;
let req: request.SuperAgentTest;
let user: { id: string };
let quotes: Array<{ id: string, link: string, content: string }>;
let stories: Array<string> = [];

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
          .limit(5)
      })
      .then((result) => {
        quotes = result;

        done && done();
      });
  });
});

afterAll((done) => {
  knex('story')
    .whereIn('id', stories)
    .del()
    .then(() =>
      server.close(() => done && done())
    )
})

describe('storyCreate as an active user', () => {

  it('Should be able to create a few stories', async () => {
    let res = await req.post('/graphql')
      .send({
        query: `
          mutation ($quote: StoryQuoteRelationInput!) {
            storyCreate (quote: $quote) {
              id
              color
              typography
              content
              link
              user {
                id
              }
            }
          }
        `,
        variables: {
          quote: {
            connect: {
              id: quotes[0].id
            }
          }
        }
      });

    expect(res.body).toHaveProperty('data.storyCreate');

    expect(res.body.data.storyCreate).not.toBeNull();
    expect(res.body.data.storyCreate).toHaveProperty('color', '#e10098');
    expect(res.body.data.storyCreate).toHaveProperty('typography', 'Arial');
    expect(res.body.data.storyCreate).toHaveProperty('content', quotes[0].content);
    expect(res.body.data.storyCreate).toHaveProperty('link', quotes[0].link);
    expect(res.body.data.storyCreate).toHaveProperty('user.id', user.id);

    stories.push(res.body.data.storyCreate.id);

    res = await req.post('/graphql')
      .send({
        query: `
          mutation ($quote: StoryQuoteRelationInput!, $color: String, $typography: Typography) {
            storyCreate (quote: $quote, color: $color, typography: $typography) {
              id
              color
              typography
              content
              link
              user {
                id
              }
            }
          }
        `,
        variables: {
          quote: {
            connect: {
              id: quotes[1].id
            }
          },
          color: '#fff',
          typography: 'Barlow'
        }
      });

    expect(res.body).toHaveProperty('data.storyCreate');

    expect(res.body.data.storyCreate).not.toBeNull();
    expect(res.body.data.storyCreate).toHaveProperty('color', '#fff');
    expect(res.body.data.storyCreate).toHaveProperty('typography', 'Barlow');
    expect(res.body.data.storyCreate).toHaveProperty('content', quotes[1].content);
    expect(res.body.data.storyCreate).toHaveProperty('link', quotes[1].link);
    expect(res.body.data.storyCreate).toHaveProperty('user.id', user.id);

    stories.push(res.body.data.storyCreate.id);

    res = await req.post('/graphql')
      .send({
        query: `
          mutation ($quote: StoryQuoteRelationInput!, $color: String, $typography: Typography) {
            storyCreate (quote: $quote, color: $color, typography: $typography) {
              id
              color
              typography
              content
              link
              user {
                id
              }
            }
          }
        `,
        variables: {
          quote: {
            connect: {
              id: quotes[2].id
            }
          },
          color: '#000',
          typography: 'Poppins'
        }
      });

    expect(res.body).toHaveProperty('data.storyCreate');

    expect(res.body.data.storyCreate).not.toBeNull();
    expect(res.body.data.storyCreate).toHaveProperty('color', '#000');
    expect(res.body.data.storyCreate).toHaveProperty('typography', 'Poppins');
    expect(res.body.data.storyCreate).toHaveProperty('content', quotes[2].content);
    expect(res.body.data.storyCreate).toHaveProperty('link', quotes[2].link);
    expect(res.body.data.storyCreate).toHaveProperty('user.id', user.id);

    stories.push(res.body.data.storyCreate.id);
  })

  it('Should fail when connection is missing', async () => {
    const res = await req.post('/graphql')
      .send({
        query: `
          mutation ($quote: StoryQuoteRelationInput!) {
            storyCreate (quote: $quote) {
              id
              color
              content
              link
              user {
                id
              }
            }
          }
        `,
        variables: { }
      });

    expect(res.body).toHaveProperty(['errors', '0', 'message']);
      
    const [{ message }] = res.body.errors;

    expect(message).toMatch(/Variable "\$quote" of required type "StoryQuoteRelationInput!" was not provided/);
  });

  it('Should throw an error when a quote of another user is provided', async () => {
    const [quote] = await knex('quote').select('*').whereNot('user_id', user.id).limit(1);

    let res = await req.post('/graphql')
      .send({
        query: `
          mutation ($quote: StoryQuoteRelationInput!) {
            storyCreate (quote: $quote) {
              id
            }
          }
        `,
        variables: {
          quote: {
            connect: {
              id: quote.id
            }
          }
        }
      });
    
    expect(res.body).toHaveProperty(['errors', '0', 'message']);
    
    const [{ message }] = res.body.errors;
    
    expect(message).toMatch(/The quote you are trying to link does not exist/);
  })

  it('Should fail when given a bad typography', async () => {
    let res = await req.post('/graphql')
      .send({
        query: `
          mutation ($quote: StoryQuoteRelationInput!, $typography: Typography) {
            storyCreate (quote: $quote, typography: $typography) {
              id
              color
              typography
              content
              link
              user {
                id
              }
            }
          }
        `,
        variables: {
          quote: {
            connect: {
              id: quotes[0].id
            }
          },
          typography: 'wrong value for typography',
        }
      });

    expect(res.body).toHaveProperty(['errors', '0', 'message']);

    const [{ message }] = res.body.errors;
    
    expect(message).toMatch(/Variable "\$typography" got invalid value/);
  })
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
          mutation ($quote: StoryQuoteRelationInput!) {
            storyCreate (quote: $quote) {
              id
              color
              content
              link
              user {
                id
              }
            }
          }
        `,
        variables: {
          quote: {
            connect: {
              id: quotes[0].id
            }
          }
        }
      });

    expect(res.body).toHaveProperty(['errors', '0', 'message']);
      
    const [{ message }] = res.body.errors;

    expect(message).toMatch(/You were banned from the platform/);
  })
})