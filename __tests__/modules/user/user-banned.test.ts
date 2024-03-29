import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { user } from '../../shared/data';
import request from 'supertest';
import { Server } from 'http';
import knex from '../../shared/knex';
import app from '../../../src/index';

let server: Server;
let req: request.SuperAgentTest;

beforeAll((done) => {
  server = app.listen(4000, () => {
    req = request.agent(server);

    /**
     * Setting authenticated user as banned
     */
    knex('user')
      .where('id', user.id)
      .update({ status: 'banned' })
      .then(() => done && done());  
  });
});

afterAll((done) => {
  server.close(() => {
    /**
     * Setting the authenticated user back
     * an active
     */
    knex('user')
      .where('id', user.id)
      .update({ status: 'active' })
      .then(() => done && done())
  });
})

describe('user related resolvers as non admin', () => {
  test('userUpdate', async () => {
    let response = await req.post('/graphql')
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

    expect(response.text).not.toBeNull();
    
    response = JSON.parse(response.text);

    expect(response).toHaveProperty(
      ['errors', '0', 'message'],
      'You were banned from the platform, ' +
      'you don\'t have permissions to perform this operation'
    );
  })

  test('userBan', async () => {
    const [userToBan] = await knex('user')
      .whereNot('id', user.id)
      .limit(1);

    let response = await req.post('/graphql')
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
      });

    expect(response.text).not.toBeNull();
    
    response = JSON.parse(response.text);

    expect(response).toHaveProperty(
      ['errors', '0', 'message'],
      'You were banned from the platform, ' +
      'you don\'t have permissions to perform this operation'
    );
  })

  test('userUnban', async () => {
    const [userToUnban] = await knex('user')
      .whereNot('id', user.id)
      .limit(1);

    let response = await req.post('/graphql')
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
    
    expect(response.text).not.toBeNull();
  
    response = JSON.parse(response.text);

    expect(response).toHaveProperty(
      ['errors', '0', 'message'],
      'You were banned from the platform, ' +
      'you don\'t have permissions to perform this operation'
    );
  })

  test('userSetRole', async () => {
    const [userToAdmin] = await knex('user')
      .whereNot('id', user.id)
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
      });

    expect(response.text).not.toBeNull();

    response = JSON.parse(response.text);

    expect(response).toHaveProperty(
      ['errors', '0', 'message'],
      'You were banned from the platform, ' +
      'you don\'t have permissions to perform this operation'
    );

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
          role: 'user'
        }
      });
    
    expect(response.text).not.toBeNull();

    response = JSON.parse(response.text);

    expect(response).toHaveProperty(
      ['errors', '0', 'message'],
      'You were banned from the platform, ' +
      'you don\'t have permissions to perform this operation'
    );
  })
})