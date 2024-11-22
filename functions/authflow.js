const { google } = require('googleapis');
const { OAuth2 } = google.auth;

// Environment variables for credentials (to be set in Netlify's dashboard)
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URIS = process.env.REDIRECT_URIS;  // If applicable

// Check if credentials are set properly
if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URIS) {
    throw new Error('Missing required environment variables for Google OAuth.');
}

// OAuth2 Client setup
const oauth2Client = new OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URIS // This should match the redirect URI you set in the Google Cloud Console
);

// Function to generate authentication URL
function generateAuthUrl() {
    const scopes = [
        'https://www.googleapis.com/auth/spreadsheets',  // For accessing Google Sheets
        // Add other required scopes here
    ];

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
    });

    return authUrl;
}

// Function to get the access token
async function getAccessToken(code) {
    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        return tokens;
    } catch (error) {
        console.error('Error getting access token:', error);
        throw new Error('Failed to get access token');
    }
}

// Function to save data to Google Sheets
async function saveDataToGoogleSheets(data) {
    try {
        // Assuming Google Sheets API is already set up
        const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

        // Your Google Sheet ID and range (you will need to replace these with actual values)
        const spreadsheetId = process.env.SPREADSHEET_ID;  // Set this as an environment variable
        const range = 'Sheet1!A2:C'; // Example range to add data

        const request = {
            spreadsheetId,
            range,
            valueInputOption: 'RAW',
            resource: {
                values: [[data.firstName, data.lastName, data.email]], // Example data format
            },
        };

        const response = await sheets.spreadsheets.values.append(request);
        console.log('Data saved:', response.data);
    } catch (error) {
        console.error('Error saving data to Google Sheets:', error);
        throw new Error('Failed to save data to Google Sheets');
    }
}

module.exports = {
    generateAuthUrl,
    getAccessToken,
    saveDataToGoogleSheets,
};