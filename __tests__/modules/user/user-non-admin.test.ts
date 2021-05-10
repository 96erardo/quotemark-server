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
    
    /**
     * Setting authenticated user as non admin
     * and fetching him
     */
    knex('user')
      .where('email', process.env.GOOGLE_AUTH_USER_EMAIL)
      .update({ role: 'user' })
      .then(() => 
        knex('user')
          .select('*')
          .where('email', process.env.GOOGLE_AUTH_USER_EMAIL)
          .limit(1)
      )
      .then(result => user = result[0])
      .then(() => done && done());  
  });
});

afterAll((done) => {
  server.close(() => {
    /**
     * Setting the authenticated user back
     * an admin
     */
    knex('user')
      .where('email', process.env.GOOGLE_AUTH_USER_EMAIL)
      .update({ role: 'admin' })
      .then(() => done && done())
  });
})

describe('user related resolvers as non admin', () => {
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
      'You don\'t have permissions to perform this operation'
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
      'You don\'t have permissions to perform this operation'
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
      'You don\'t have permissions to perform this operation'
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
      'You don\'t have permissions to perform this operation'
    );
  })
})