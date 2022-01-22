import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { Server } from 'http';
import { user } from '../../shared/data';
import knex from '../../shared/knex';
import app from '../../../src/index';

let server: Server;
let req: request.SuperAgentTest;
let reports: Array<Record<string, any>>;

beforeAll((done) => {
  server = app.listen(4000, () => {
    req = request.agent(server);

    done && done();
  });
});

afterAll((done) => {
  server.close(() => done && done())
})

describe('reportUpdate as an active user', () => {

  it('Should be able to approve a report', async () => {
    reports = await knex('report').select('*').where('status', 'pending').whereNull('deleted_at').limit(1);

    const res = await req.post('/graphql')
      .send({
        query: `
          mutation ($id: ID!, $status: String!) {
            reportUpdate (id: $id, status: $status) {
              id
              status
            }
          }
        `,
        variables: {
          id: reports[0].id,
          status: 'approved'
        }
      });

    expect(res.body).toHaveProperty('data.reportUpdate');

    expect(res.body.data.reportUpdate).not.toBeNull();
    expect(res.body.data.reportUpdate).toHaveProperty('status', 'approved');
  })

  it('Should be able to reject a report', async () => {
    const res = await req.post('/graphql')
      .send({
        query: `
          mutation ($id: ID!, $status: String!) {
            reportUpdate (id: $id, status: $status) {
              id
              status
            }
          }
        `,
        variables: {
          id: reports[0].id,
          status: 'rejected'
        }
      })

    expect(res.body).toHaveProperty('data.reportUpdate');

    expect(res.body.data.reportUpdate).not.toBeNull();
    expect(res.body.data.reportUpdate).toHaveProperty('status', 'rejected');
  })

  it('Should be able set a report as pending', async () => {
    const res = await req.post('/graphql')
      .send({
        query: `
          mutation ($id: ID!, $status: String!) {
            reportUpdate (id: $id, status: $status) {
              id
              status
            }
          }
        `,
        variables: {
          id: reports[0].id,
          status: 'pending'
        }
      })

    expect(res.body).toHaveProperty('data.reportUpdate');

    expect(res.body.data.reportUpdate).not.toBeNull();
    expect(res.body.data.reportUpdate).toHaveProperty('status', 'pending');
  })

  it('Should fail when the report does not exist', async () => {
    const res = await req.post('/graphql')
      .send({
        query: `
          mutation ($id: ID!, $status: String!) {
            reportUpdate (id: $id, status: $status) {
              id
              status
            }
          }
        `,
        variables: {
          id: 'fake-report-id',
          status: 'rejected'
        }
      })

    expect(res.body).toHaveProperty(['errors', '0', 'message']);
    
    const [{ message }] = res.body.errors;

    expect(message).toMatch(/The report you are trying to update does not exist/);
  })

  it('Should fail when the status is not valid', async () => {
    const res = await req.post('/graphql')
      .send({
        query: `
          mutation ($id: ID!, $status: String!) {
            reportUpdate (id: $id, status: $status) {
              id
              status
            }
          }
        `,
        variables: {
          id: 'fake-report-id',
          status: 'married'
        }
      })

    expect(res.body).toHaveProperty(['errors', '0', 'message']);
    
    const [{ message }] = res.body.errors;

    expect(message).toMatch(/The status is invalid, please choose one of "pending", "approved" or "rejected"/);
  })
})

describe('reportUpdate as a banned user', () => {
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
          mutation ($id: ID!, $status: String!) {
            reportUpdate (id: $id, status: $status) {
              id
              status
            }
          }
        `,
        variables: {
          id: reports[0].id,
          status: 'pending',
        }
      });

    expect(res.body).toHaveProperty(['errors', '0', 'message']);
      
    const [{ message }] = res.body.errors;

    expect(message).toMatch(/You were banned from the platform/);
  })
})

describe('reportUpdate not beign admin', () => {
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

  it('Should deny access when user is not an admin', async () => {
    const res = await req.post('/graphql')
      .send({
        query: `
          mutation ($id: ID!, $status: String!) {
            reportUpdate (id: $id, status: $status) {
              id
              status
            }
          }
        `,
        variables: {
          id: reports[0].id,
          status: 'pending',
        }
      });

    expect(res.body).toHaveProperty(['errors', '0', 'message']);
      
    const [{ message }] = res.body.errors;

    expect(message).toMatch(/You don't have permissions to perform this operation/);
  })
})