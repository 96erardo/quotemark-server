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

        if (done) {
          done();
        }          
      });  
  });
});

afterAll((done) => {
  knex('quote')
    .where('user_id', user.id)
    .del()
    .then(() =>
      server.close(() => done && done())
    )
})

describe('quoteCreate as an active user', () => {
  it('Should be able to create a few quotes', async () => {
    let response = await req.post('/graphql')
      .send({
        query: `
          mutation ($data: QuoteCreateInput!) {
            quoteCreate (data: $data) {
              id
              name
              content
              link
              user {
                id
              }
            }
          }
        `,
        variables: {
          data: {
            name: 'Quote #1',
            content: 'Hello World #1',
            link: 'https://localhost:4000/api/hello',
          }
        }
      });

    expect(response.body).toHaveProperty('data.quoteCreate');

    expect(response.body.data.quoteCreate).not.toBeNull();
    expect(response.body.data.quoteCreate).toHaveProperty('user.id', user.id);
    expect(response.body.data.quoteCreate).toHaveProperty('name', 'Quote #1');

    response = await req.post('/graphql')
      .send({
        query: `
          mutation ($data: QuoteCreateInput!) {
            quoteCreate (data: $data) {
              id
              name
              content
              link
              user {
                id
              }
            }
          }
        `,
        variables: {
          data: {
            name: 'Quote #2',
            content: 'Hello World #2',
            link: 'https://localhost:4000/api/hello',
          }
        }
      });

    expect(response.body).toHaveProperty('data.quoteCreate');

    expect(response.body.data.quoteCreate).not.toBeNull();
    expect(response.body.data.quoteCreate).toHaveProperty('user.id', user.id);
    expect(response.body.data.quoteCreate).toHaveProperty('name', 'Quote #2');

    response = await req.post('/graphql')
      .send({
        query: `
          mutation ($data: QuoteCreateInput!) {
            quoteCreate (data: $data) {
              id
              name
              content
              link
              user {
                id
              }
            }
          }
        `,
        variables: {
          data: {
            name: 'Quote #3',
            content: 'Hello World #3',
            link: 'https://localhost:4000/api/hello',
          }
        }
      });

    expect(response.body).toHaveProperty('data.quoteCreate');

    expect(response.body.data.quoteCreate).not.toBeNull();
    expect(response.body.data.quoteCreate).toHaveProperty('user.id', user.id);
    expect(response.body.data.quoteCreate).toHaveProperty('name', 'Quote #3');
  })

  it('Should fail when content is missing', async () => {
    const response = await req.post('/graphql')
      .send({
        query: `
          mutation ($data: QuoteCreateInput!) {
            quoteCreate (data: $data) {
              id
              name
              content
              link
              user {
                id
              }
            }
          }
        `,
        variables: {
          data: {
            name: 'Quote #3',
            link: 'https://localhost:4000/api/hello',
          }
        }
      });

    expect(response.body).toHaveProperty(['errors', '0', 'message']);
      
    const [{ message }] = response.body.errors;

    expect(message).toMatch(/Field "content" of required type "String!" was not provided/);
  });

  it('Should fail when link is missing', async () => {
    let response = await req.post('/graphql')
      .send({
        query: `
          mutation ($data: QuoteCreateInput!) {
            quoteCreate (data: $data) {
              id
              name
              content
              link
              user {
                id
              }
            }
          }
        `,
        variables: {
          data: {
            name: 'Quote #3',
            content: 'Quote #4',
          }
        }
      });

    expect(response.body).toHaveProperty(['errors', '0', 'message']);
      
    const [{ message }] = response.body.errors;

    expect(message).toMatch(/Field "link" of required type "String!" was not provided/);
  });
})

describe('quoteCreate as a banned user', () => {
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
    const response = await req.post('/graphql')
      .send({
        query: `
          mutation ($data: QuoteCreateInput!) {
            quoteCreate (data: $data) {
              id
              name
              content
              link
              user {
                id
              }
            }
          }
        `,
        variables: {
          data: {
            name: 'Quote #5',
            content: 'Content',
            link: 'https://localhost:4000/api/hello',
          }
        }
      });

    expect(response.body).toHaveProperty(['errors', '0', 'message']);
      
    const [{ message }] = response.body.errors;

    expect(message).toMatch(/You were banned from the platform/);
  })
})