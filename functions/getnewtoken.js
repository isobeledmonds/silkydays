const { google } = require('googleapis');
const readline = require('readline');
const fs = require('fs');
require('dotenv').config(); // To load environment variables

const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function getNewToken() {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('Authorize this app by visiting this URL:', authUrl);
  
  rl.question('Enter the code from that page here: ', async (code) => {
    rl.close();

    try {
      // Get the token using the authorization code
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);
      
      console.log('Tokens acquired.');

      // Save the refresh token to the .env file
      const envContent = `REFRESH_TOKEN=${tokens.refresh_token}\n`;
      fs.appendFileSync('.env', envContent); // Append to .env instead of overwrite to avoid accidental data loss

      console.log('Refresh token saved to .env file.');
    } catch (error) {
      console.error('Error during token acquisition:', error.message);
    }
  });
}

getNewToken();