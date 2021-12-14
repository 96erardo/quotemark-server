/* eslint-disable camelcase */
import { RequestHandler } from 'express'
import { google, people_v1 } from 'googleapis'
import { GaxiosResponse } from 'gaxios'
import knex from '../configuration/knex'

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
    return res.json({
      errors: [
        {
          message: e.message,
          extensions: {
            code: 'UNAUTHENTICATED'
          }
        }
      ]
    })
  }

  const { data } = response

  const [profile] = data.metadata?.sources || []
  const [names] = data.names || []
  const [photo] = data.photos || []
  const [email] = data.emailAddresses || []

  const [user] = await knex
    .select()
    .from('user')
    .where({ id: profile.id })
    .limit(1)

  res.locals.id = profile.id

  if (user) {
    res.locals.user = user

    return next()
  }

  await knex('user').insert({
    id: profile.id,
    first_name: names.givenName,
    last_name: names.familyName,
    email: email.value,
    avatar: photo.url
  })

  const [created] = await knex.select()
    .from('user')
    .where({
      id: profile.id
    })
    .limit(1)

  res.locals.user = created

  next()
}
