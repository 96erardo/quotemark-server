import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { Server } from 'http';
import { user } from '../../shared/data';
import knex from '../../shared/knex';
import app from '../../../src/index';
import faker from 'faker';

let server: Server;
let req: request.SuperAgentTest;
let reports: Array<string> = [];

beforeAll((done) => {
  server = app.listen(4000, () => {
    req = request.agent(server);
    
    done && done();
  });
});

afterAll((done) => {
  server.close(() => done && done())
})

describe('reportsList as an admin user', () => {

  it('Should be able to list reports', async () => {
    const res = await req.post('/graphql')
      .send({
        query: `
          query ($filter: ReportFilter, $first: Int, $skip: Int) {
            reportsList (filter: $filter, first: $first, skip: $skip) {
              count
              items {
                id
                reason
                status
                story {
                  id
                }
                user {
                  id
                }
                deletedAt
              }
            }
          }
        `,
        variables: { }
      });

    expect(res.body).toHaveProperty('data.reportsList');

    expect(res.body.data.reportsList).not.toBeNull();

    const { reportsList } = res.body.data;

    expect(reportsList.count).toBeGreaterThan(0);
    expect(reportsList.items.length).toBeGreaterThan(0);

    for (const report of reportsList.items) {
      expect(report.deletedAt).toBeNull();
    }

    reports.push(res.body.data.reportsList.id);
  })

  it('Should filter the reports in the list', async () => {
    const res = await req.post('/graphql')
      .send({
        query: `
          query ($filter: ReportFilter, $first: Int, $skip: Int) {
            reportsList (filter: $filter, first: $first, skip: $skip) {
              count
              items {
                id
                reason
                status
                story {
                  id
                }
                user {
                  id
                }
                deletedAt
              }
            }
          }
        `,
        variables: {
          filter: {
            status: {
              equals: 'pending',
            }
          }
        }
      });

    expect(res.body).toHaveProperty('data.reportsList');

    expect(res.body.data.reportsList).not.toBeNull();

    const { reportsList } = res.body.data;

    for (const report of reportsList.items) {
      expect(report.status).toBe('pending');
      expect(report.deletedAt).toBeNull();
    }
  })

  it('Should return a specific number of reports', async () => {
    const res = await req.post('/graphql')
      .send({
        query: `
          query ($filter: ReportFilter, $first: Int, $skip: Int) {
            reportsList (filter: $filter, first: $first, skip: $skip) {
              count
              items {
                id
              }
            }
          }
        `,
        variables: {
          first: 5
        }
      });

    expect(res.body).toHaveProperty('data.reportsList');

    expect(res.body.data.reportsList).not.toBeNull();

    const { reportsList } = res.body.data;

    expect(reportsList.items.length).toBeLessThanOrEqual(5);
  })
})

describe('reportsList as a normal user', () => {
  beforeAll((done) => {
    knex('user')
      .where('id', user.id)
      .update({ role: 'user' })
      .then(() => done && done())
  })

  afterAll((done) => {
    knex('user')
      .where('id', user.id)
      .update({ role: 'admin' })
      .then(() => done && done())
  })

  it('Should deny access when user is not admin', async () => {
    const res = await req.post('/graphql')
      .send({
        query: `
          query ($filter: ReportFilter, $first: Int, $skip: Int) {
            reportsList (filter: $filter, first: $first, skip: $skip) {
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

    expect(message).toMatch(/You don't have permissions to perform this operation/);
  })
})

describe('reportsList as a normal user', () => {
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
          query ($filter: ReportFilter, $first: Int, $skip: Int) {
            reportsList (filter: $filter, first: $first, skip: $skip) {
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