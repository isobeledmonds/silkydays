const { google } = require('googleapis');
const readline = require('readline');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    console.error("Missing required environment variables: CLIENT_ID, CLIENT_SECRET, or REDIRECT_URI");
    throw new Error("Ensure CLIENT_ID, CLIENT_SECRET, and REDIRECT_URI are properly set in your environment.");
}

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Generate the authorization URL
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'];
const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',  // This ensures we get a refresh token
    scope: SCOPES,
});

console.log('Authorize this app by visiting this URL:', authUrl);

// Create readline interface for getting the code from the user
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter the code from that page here: ', async (code) => {
    rl.close();
    try {
        // Get the tokens using the code
        const { tokens } = await oAuth2Client.getToken(code);
        console.log('Tokens acquired:', tokens);

        // Log the tokens in detail
        console.log('Access Token:', tokens.access_token);
        console.log('Refresh Token:', tokens.refresh_token);

        // Check if a refresh token is included
        if (tokens.refresh_token) {
            console.log('Refresh token:', tokens.refresh_token);

            // Save the refresh token to your .env file
            fs.appendFileSync('.env', `REFRESH_TOKEN=${tokens.refresh_token}\n`);
            console.log('Refresh token saved to .env file.');
        } else {
            console.log('No refresh token received.');
        }

        // Optionally, save the access token (if you want to keep it for later use)
        fs.appendFileSync('.env', `ACCESS_TOKEN=${tokens.access_token}\n`);
        console.log('Access token saved to .env file.');

    } catch (error) {
        console.error('Error acquiring tokens:', error);
    }
});