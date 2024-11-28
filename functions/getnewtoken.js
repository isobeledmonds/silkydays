const { google } = require('googleapis');
const fs = require('fs');

const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'];

exports.handler = async function (event, context) {
  if (event.httpMethod === 'GET') {
    // Capture the authorization code from the query string
    const queryParams = new URLSearchParams(event.queryStringParameters);
    const code = queryParams.get('code');

    if (code) {
      try {
        // Exchange the authorization code for tokens
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        console.log('Tokens acquired:', tokens);

        // Save the refresh token to .env (locally for now, can be used securely)
        fs.writeFileSync('.env', `REFRESH_TOKEN=${tokens.refresh_token}\n`);
        console.log('Refresh token saved to .env file.');

        // Respond to indicate success
        return {
          statusCode: 200,
          body: JSON.stringify({ message: 'Tokens acquired successfully!' }),
        };
      } catch (error) {
        console.error('Error getting tokens:', error);
        return {
          statusCode: 500,
          body: JSON.stringify({ message: 'Error acquiring tokens', error: error.message }),
        };
      }
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'No authorization code provided in the query string' }),
      };
    }
  }

  // If it's not a GET request, return an error
  return {
    statusCode: 405,
    body: JSON.stringify({ message: 'Method Not Allowed' }),
  };
};