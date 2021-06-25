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
  server.close(() => done && done())
});

describe('quotesList with an active user', () => {
  it('Should return the right quantity of quotes', async () => {
    let res = await req.post('/graphql')
      .send({
        query: `
          query ($first: Int) {
            quotesList (first: $first) {
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
        variables: {
          first: 3
        }
      })
    
    expect(res.body).toHaveProperty('data.quotesList');

    expect(res.body.data.quotesList.count).toBe(20);
    expect(res.body.data.quotesList.items).toHaveLength(3);

    for (const item of res.body.data.quotesList.items) {
      expect(item.user.id).toBe(user.id);
    }

    res = await req.post('/graphql')
      .send({
        query: `
          query ($first: Int) {
            quotesList (first: $first) {
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
        variables: {
          first: 13
        }
      })
    
    expect(res.body).toHaveProperty('data.quotesList');

    expect(res.body.data.quotesList.count).toBe(20);
    expect(res.body.data.quotesList.items).toHaveLength(13);

    for (const item of res.body.data.quotesList.items) {
      expect(item.user.id).toBe(user.id);
    }

    res = await req.post('/graphql')
      .send({
        query: `
          query ($first: Int) {
            quotesList (first: $first) {
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
        variables: {
          first: 1
        }
      })
    
    expect(res.body).toHaveProperty('data.quotesList');

    expect(res.body.data.quotesList.count).toBe(20);
    expect(res.body.data.quotesList.items).toHaveLength(1);

    for (const item of res.body.data.quotesList.items) {
      expect(item.user.id).toBe(user.id);
    }

    res = await req.post('/graphql')
      .send({
        query: `
          query ($first: Int) {
            quotesList (first: $first) {
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
        variables: {
          first: 50
        }
      })
    
    expect(res.body).toHaveProperty('data.quotesList');

    expect(res.body.data.quotesList.count).toBe(20);
    expect(res.body.data.quotesList.items).toHaveLength(20);

    for (const item of res.body.data.quotesList.items) {
      expect(item.user.id).toBe(user.id);
    }
  })

  it('Should skip items in the list', async () => {
    let res = await req.post('/graphql')
      .send({
        query: `
          query ($skip: Int) {
            quotesList (skip: $skip) {
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
        variables: {
          skip: 18
        }
      })
    
    expect(res.body).toHaveProperty('data.quotesList');

    expect(res.body.data.quotesList.count).toBe(20);
    expect(res.body.data.quotesList.items).toHaveLength(2);

    for (const item of res.body.data.quotesList.items) {
      expect(item.user.id).toBe(user.id);
    }

    res = await req.post('/graphql')
      .send({
        query: `
          query ($skip: Int) {
            quotesList (skip: $skip) {
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
        variables: {
          skip: 15
        }
      })
    
    expect(res.body).toHaveProperty('data.quotesList');

    expect(res.body.data.quotesList.count).toBe(20);
    expect(res.body.data.quotesList.items).toHaveLength(5);

    for (const item of res.body.data.quotesList.items) {
      expect(item.user.id).toBe(user.id);
    }

    res = await req.post('/graphql')
      .send({
        query: `
          query ($skip: Int) {
            quotesList (skip: $skip) {
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
        variables: {
          skip: 30
        }
      })
    
    expect(res.body).toHaveProperty('data.quotesList');

    expect(res.body.data.quotesList.count).toBe(20);
    expect(res.body.data.quotesList.items).toHaveLength(0);

    for (const item of res.body.data.quotesList.items) {
      expect(item.user.id).toBe(user.id);
    }
  })

  it('Should filter the results', async () => {
    let res = await req.post('/graphql')
      .send({
        query: `
          query ($filter: QuoteFilter) {
            quotesList (filter: $filter) {
              count
              items {
                id
                link
                user {
                  id
                }
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

    expect(res.body).toHaveProperty('data.quotesList');

    for (const quote of res.body.data.quotesList.items) {
      expect(quote.link).toMatch(/^https/);
    }

    res = await req.post('/graphql')
      .send({
        query: `
          query ($filter: QuoteFilter) {
            quotesList (filter: $filter) {
              count
              items {
                id
                link
                user {
                  id
                }
              }
            }
          }
        `,
        variables: {
          filter: {
            link: {
              ends_with: '.com'
            }
          }
        }
      })

    expect(res.body).toHaveProperty('data.quotesList');

    for (const quote of res.body.data.quotesList.items) {
      expect(quote.link).toMatch(/\.com$/);
    }

    res = await req.post('/graphql')
      .send({
        query: `
          query ($filter: QuoteFilter) {
            quotesList (filter: $filter) {
              count
              items {
                id
                link
                user {
                  id
                }
              }
            }
          }
        `,
        variables: {
          filter: {
            AND: [
              { link: { starts_with: 'http' } },
              { link: { ends_with: '.com' } },
            ]
          }
        }
      })

    expect(res.body).toHaveProperty('data.quotesList');

    for (const quote of res.body.data.quotesList.items) {
      expect(quote.link).toMatch(/^http/);
      expect(quote.link).toMatch(/\.com$/);
    }
  })
});

describe('quotesList with a banned user', () => {
  beforeAll((done) => {
    knex('user')
      .where('id', user.id)
      .update({ status: 'banned' })
      .then(() => done && done())
  })

  it('Should respond with an error', async () => {
    let res = await req.post('/graphql')
      .send({
        query: `
          query ($filter: QuoteFilter) {
            quotesList (filter: $filter) {
              count
              items {
                id
                link
                user {
                  id
                }
              }
            }
          }
        `,
        variables: {
          filter: {
            AND: [
              { link: { starts_with: 'http' } },
              { link: { ends_with: '.com' } },
            ]
          }
        }
      })

    expect(res.body).toHaveProperty(['errors', '0', 'message']);
    
    const [{ message }] = res.body.errors;

    expect(message).toMatch(/You were banned from the platform/);
  })

  afterAll((done) => {
    knex('user')
      .where('id', user.id)
      .update({ status: 'active' })
      .then(() => done && done())
  })
})