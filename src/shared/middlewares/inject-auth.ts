import { RequestHandler } from 'express'
import { google } from 'googleapis'


/**
 * Global middleware that automatically authenticates a user
 * for automated tests and graphqli. This should only run
 * in testing and development environments
 */
export const injectAuth: RequestHandler = async (req, _, next) => {
  const origin = req.get('host') || req.get('origin')
  const port = process.env.PORT || 4000;
  const { 1: accessToken } = req.get('Authorization')?.split(' ') || []

  if (
      (origin === `localhost:${port}` || process.env.NODE_ENV === 'test') &&
      !accessToken
    ) {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_AUTH_CLIENT_ID,
      process.env.GOOGLE_AUTH_CLIENT_SECRET
    )

    oAuth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_AUTH_REFRESH_TOKEN
    })

    const { token } = await oAuth2Client.getAccessToken()

    req.headers.authorization = `Bearer ${token}`
  }

  next()
}
