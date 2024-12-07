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

// Define the scopes
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'];

// Generate the authorization URL
const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',  // This ensures we get a refresh token
    scope: SCOPES,
});

// Netlify function handler
exports.handler = async (event, context) => {
    if (event.httpMethod === 'GET') {
        return {
            statusCode: 200,
            body: JSON.stringify({ authUrl })
        };
    }

    if (event.httpMethod === 'POST') {
        const code = JSON.parse(event.body).code;
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

            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Tokens saved successfully!' }),
            };
        } catch (error) {
            console.error('Error acquiring tokens:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Error acquiring tokens', error: error.message }),
            };
        }
    }

    return {
        statusCode: 405,
        body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
};