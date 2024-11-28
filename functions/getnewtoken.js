const { google } = require('googleapis');
const readline = require('readline');
const fs = require('fs');
require('dotenv').config();  // Ensure environment variables are loaded

// Log environment variables to debug
console.log('CLIENT_ID:', process.env.CLIENT_ID);
console.log('CLIENT_SECRET:', process.env.CLIENT_SECRET);
console.log('REDIRECT_URI:', process.env.REDIRECT_URI);

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
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);
      console.log('Tokens acquired.');
      
      const envContent = `REFRESH_TOKEN=${tokens.refresh_token}\n`;
      fs.appendFileSync('.env', envContent);

      console.log('Refresh token saved to .env file.');
    } catch (error) {
      console.error('Error during token acquisition:', error.message);
    }
  });
}

getNewToken();