/* eslint-disable camelcase */
import { RequestHandler } from 'express'
import { google, people_v1 } from 'googleapis'
import { GaxiosResponse } from 'gaxios'
import knex from '../configuration/knex';
import { ErrorCodes } from '../types';

/**
 * Global middleware that handles user authentication
 *
 * @param req - The request object
 * @param res - The response object
 * @param next - Function to call the next route handler
 *
 * @returns {Promise<void>}
 */
export const authenticate: RequestHandler = async (req, res, next) => {
  const { 1: accessToken } = req.get('Authorization')?.split(' ') || []
  let response: GaxiosResponse<people_v1.Schema$Person>

  const api = google.people({
    version: 'v1',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })

  try {
    response = await api.people.get({
      personFields: 'names,birthdays,emailAddresses,photos,metadata',
      resourceName: 'people/me'
    })
    
  } catch (e) {
    return res.status(401).json({
      errors: [
        {
          message: e.message,
          extensions: {
            code: ErrorCodes.Authentication,
          }
        }
      ]
    })
  }

  const { data } = response;

  const [profile] = data.metadata?.sources || []
  const [names] = data.names || []
  const [photo] = data.photos || []
  const [email] = data.emailAddresses || []
  let user = null;

  try {
    const users = await knex
      .select()
      .from('user')
      .where({ id: profile.id })
      .limit(1);

    user = users[0];

  } catch (e) {
    return res.status(500).json({
      errors: [
        {
          message: e.message,
          extensions: {
            code: ErrorCodes.ServerException
          }
        }
      ]
    })
  }

  res.locals.id = profile.id

  if (user) {
    res.locals.user = user

    return next()
  }

  try {
    await knex('user').insert({
      id: profile.id,
      first_name: names.givenName,
      last_name: names.familyName,
      email: email.value,
      avatar: photo.url
    })
    
  } catch (e) {
    return res.status(500).json({
      errors: [
        {
          message: e.message,
          extensions: {
            code: ErrorCodes.ServerException,
          }
        }
      ]
    })
  }

  try {
    const [created] = await knex.select()
      .from('user')
      .where({
        id: profile.id
      })
      .limit(1)

      res.locals.user = created
    
      next()

  } catch (e) {
    return res.status(500).json({
      errors: [
        {
          message: e.message,
          extensions: {
            code: ErrorCodes.ServerException
          }
        }
      ]
    })
  }
}
