require('dotenv').config(); // Load environment variables from .env

const { google } = require('googleapis');
const readline = require('readline');

// Load environment variables
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;

// Log the loaded environment variables for debugging
console.log('Loaded Environment Variables:');
console.log('CLIENT_ID:', CLIENT_ID || 'Not defined');
console.log('CLIENT_SECRET:', CLIENT_SECRET ? 'Loaded' : 'Not defined');
console.log('REDIRECT_URI:', REDIRECT_URI || 'Not defined');

if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
  console.error('Missing required environment variables. Please check your .env file.');
  process.exit(1); // Exit script if environment variables are missing
}

// Create OAuth2 client
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Define the required scopes
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'];

// Function to generate a new token
async function getNewToken() {
  try {
    // Generate the authorization URL
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });

    // Log the authorization URL
    console.log('Authorize this app by visiting this URL:', authUrl);

    // Ask the user to enter the authorization code
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('Enter the code from that page here: ', async (code) => {
      rl.close();
      try {
        // Exchange the code for tokens
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        console.log('Tokens acquired:', tokens);

        // Log the refresh token
        console.log('Your refresh token:', tokens.refresh_token);

        // Save the refresh token to a .env file
        const fs = require('fs');
        fs.appendFileSync('.env', `\nREFRESH_TOKEN=${tokens.refresh_token}\n`);
        console.log('Refresh token saved to .env file.');
      } catch (tokenError) {
        console.error('Error retrieving access token:', tokenError.message);
      }
    });
  } catch (error) {
    console.error('Error generating authorization URL:', error.message);
  }
}

// Run the function
getNewToken();