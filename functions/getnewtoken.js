const { google } = require("googleapis");
const readline = require("readline");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Google API Credentials from .env
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    console.error("Missing required environment variables: CLIENT_ID, CLIENT_SECRET, or REDIRECT_URI");
    throw new Error("Ensure CLIENT_ID, CLIENT_SECRET, and REDIRECT_URI are properly set in your environment.");
}

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// The Google API Scopes
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'];

// Function to generate the authorization URL
function generateAuthUrl() {
    return oAuth2Client.generateAuthUrl({
        access_type: 'offline',  // This ensures you get a refresh token
        scope: SCOPES
    });
}

// Handle incoming requests to the redirect URI
exports.handler = async (event, context) => {
    const code = event.queryStringParameters.code;

    if (!code) {
        // If the code parameter is not found, redirect to the auth URL
        return {
            statusCode: 302,
            headers: {
                Location: generateAuthUrl()  // This redirects to the auth URL for user authorization
            }
        };
    }

    // If the code is present, attempt to exchange it for tokens
    try {
        const { tokens } = await oAuth2Client.getToken(code);
        console.log('Tokens acquired:', tokens);

        if (tokens.refresh_token) {
            // Store the refresh token securely
            process.env.REFRESH_TOKEN = tokens.refresh_token;
            console.log('Refresh token saved to environment.');
        }

        // Optionally, save the access token (can be used for immediate use)
        process.env.ACCESS_TOKEN = tokens.access_token;
        console.log('Access token saved to environment.');

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Tokens successfully obtained!",
                refresh_token: tokens.refresh_token,
                access_token: tokens.access_token
            })
        };

    } catch (error) {
        console.error("Error during token exchange:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Failed to exchange code for tokens",
                error: error.message
            })
        };
    }
};