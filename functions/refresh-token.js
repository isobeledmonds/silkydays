const { google } = require('googleapis');
const dotenv = require('dotenv');
dotenv.config();

// Retrieve access and refresh tokens from environment variables
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI || !ACCESS_TOKEN || !REFRESH_TOKEN) {
    console.error("Missing required environment variables");
    throw new Error("Ensure all environment variables are set.");
}

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Set initial credentials with the stored refresh token
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function refreshAccessToken() {
    try {
        // Attempt to refresh the access token using the stored refresh token
        const { credentials } = await oAuth2Client.refreshAccessToken();
        const newAccessToken = credentials.access_token;

        console.log("New access token:", newAccessToken);

        // You can then use the new access token to make API requests
        // You can store this new access token in your environment variables or a secure store
        process.env.ACCESS_TOKEN = newAccessToken;

        return newAccessToken;
    } catch (error) {
        console.error("Failed to refresh access token:", error);
        return null;
    }
}

// Call the function to refresh the token when necessary
async function makeApiCall() {
    const accessToken = ACCESS_TOKEN || await refreshAccessToken();

    if (!accessToken) {
        console.error("Unable to retrieve valid access token.");
        return;
    }

    const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });
    // Make API requests with the refreshed access token
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: 'your-spreadsheet-id',
        range: 'Sheet1!A1:C10',
    });
    console.log(response.data);
}

makeApiCall();