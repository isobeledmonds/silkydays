const { google } = require('googleapis');
const fs = require('fs');
require('dotenv').config();

const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'];

// Netlify function handler
exports.handler = async (event, context) => {
  if (event.httpMethod === 'GET') {
    // If it's a GET request, generate the authorization URL
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Authorize this app by visiting the URL',
        authUrl: authUrl,
      }),
    };
  }

  // If it's a POST request, exchange the authorization code for tokens
  if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body);
    const code = body.code; // The authorization code from the user

    if (!code) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Authorization code is required.' }),
      };
    }

    try {
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);
      console.log('Tokens acquired.');
      // Save the refresh token to a file or environment variable
      fs.writeFileSync('.env', `REFRESH_TOKEN=${tokens.refresh_token}\n`);
      console.log('Refresh token saved to .env file.');

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Token generated successfully' }),
      };
    } catch (error) {
      console.error('Error during token generation:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Token generation failed', details: error.message }),
      };
    }
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Method not allowed' }),
  };
};