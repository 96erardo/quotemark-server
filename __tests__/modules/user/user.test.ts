import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
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
})

describe('user related resolvers', () => {
  test('user', async () => {
    const response = await req.post('/graphql')
      .send({
        query: `
          query {
            user {
              id
              firstName
              lastName
              email
              avatar
            }
          }
        `
      });

      expect(response.body).toHaveProperty('data.user');
  
      const { data: { user } } = response.body;
  
      expect(user).not.toBeNull();
      expect(user.email).not.toBeNull();
  });

  test('userUpdate', async () => {
    const response = await req.post('/graphql')
      .send({
        query: `
          mutation ($data: UserUpdateInput!) {
            userUpdate (data: $data) {
              id
              firstName
              lastName
            }
          }
        `,
        variables: {
          data: {
            firstName: 'John',
            lastName: 'Doe'
          }
        }
      });

    expect(response.body).toHaveProperty('data.userUpdate');

    const { data: { userUpdate } } = response.body;

    expect(userUpdate).not.toBeNull();
    expect(userUpdate).toHaveProperty('firstName', 'John');
    expect(userUpdate).toHaveProperty('lastName', 'Doe');
  });

  test('userBan', async () => {
    const [userToBan] = await knex('user')
      .whereNot('id', user.id)
      .limit(1);

    const response = await req.post('/graphql')
      .send({
        query: `
          mutation ($id: ID!) {
            userBan (id: $id) {
              id
              firstName
              lastName
              status
            }
          }
        `,
        variables: {
          id: userToBan.id
        }
      })

    expect(response.body).toHaveProperty('data.userBan');

    const { data: { userBan } } = response.body;

    expect(userBan).not.toBeNull();
    expect(userBan).toHaveProperty('status', 'banned');
  })

  test('userUnban', async () => {
    const [userToUnban] = await knex('user')
      .where('status', 'banned')
      .limit(1);

    const response = await req.post('/graphql')
      .send({
        query: `
          mutation ($id: ID!) {
            userUnban (id: $id) {
              id
              firstName
              lastName
              status
            }
          }
        `,
        variables: {
          id: userToUnban.id
        }
      });

    expect(response.body).toHaveProperty('data.userUnban');

    const { data: { userUnban } } = response.body;

    expect(userUnban).not.toBeNull();
    expect(userUnban).toHaveProperty('status', 'active');
  })

  test('userSetRole', async () => {
    const [userToAdmin] = await knex('user')
      .where('role', 'user')
      .limit(1);

    let response = await req.post('/graphql')
      .send({
        query: `
          mutation ($id: ID!, $role: Role!) {
            userSetRole (id: $id, role: $role) {
              id
              firstName
              lastName
              role
            }
          }
        `,
        variables: {
          id: userToAdmin.id,
          role: 'admin',
        }
      })

    expect(response.body).toHaveProperty('data.userSetRole');

    expect(response.body.data.userSetRole).not.toBeNull();
    expect(response.body.data.userSetRole).toHaveProperty('role', 'admin');

    response = await req.post('/graphql')
      .send({
        query: `
          mutation ($id: ID!, $role: Role!) {
            userSetRole (id: $id, role: $role) {
              id
              firstName
              lastName
              role
            }
          }
        `,
        variables: {
          id: userToAdmin.id,
          role: 'user',
        }
      })

    expect(response.body).toHaveProperty('data.userSetRole');

    expect(response.body.data.userSetRole).not.toBeNull();
    expect(response.body.data.userSetRole).toHaveProperty('role', 'user');
  })
})