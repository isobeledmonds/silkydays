require("dotenv").config();
const { google } = require("googleapis");
const fs = require("fs");

const TOKEN_PATH = "/tmp/token.json";
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, SPREADSHEET_ID, REFRESH_TOKEN } = process.env;

// OAuth2 client setup
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Function to initialize or load token
function initializeToken() {
    const token = {
        refresh_token: REFRESH_TOKEN,
        scope: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'].join(' '),
        token_type: 'Bearer',
        expiry_date: Date.now() + 3600 * 1000 // 1 hour
    };
    oAuth2Client.setCredentials(token);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
    console.log('Initialized token from environment variables and saved to /tmp/token.json');
}

// Load the token from the file or environment variables
if (fs.existsSync(TOKEN_PATH)) {
    try {
        const token = fs.readFileSync(TOKEN_PATH, 'utf8');
        oAuth2Client.setCredentials(JSON.parse(token));
        console.log('Loaded token from file:', JSON.parse(token));
    } catch (error) {
        console.error('Error reading token file:', error.message);
        initializeToken();
    }
} else {
    console.log('Token file not found, creating from environment variables.');
    initializeToken();
}

// Function to refresh the access token if expired
async function refreshAccessToken() {
    try {
        const { credentials } = await oAuth2Client.refreshAccessToken();
        const newAccessToken = credentials.access_token;

        // Save the new token
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(oAuth2Client.credentials));
        console.log('Tokens refreshed and saved:', oAuth2Client.credentials);

        return newAccessToken;
    } catch (error) {
        console.error('Error refreshing token:', error.message);
        throw new Error("Unable to refresh access token");
    }
}

// Function to save data to Google Sheets
async function saveDataToGoogleSheets(data) {
    try {
        // Get the access token (refresh if necessary)
        let accessToken = process.env.ACCESS_TOKEN || await refreshAccessToken();
        
        // Set the refreshed access token for the client
        oAuth2Client.setCredentials({ access_token: accessToken });

        const sheets = google.sheets({ version: "v4", auth: oAuth2Client });

        // Define the range and data
        const range = "Sheet1!A2:D"; // Adjust this based on your sheet's layout
        const resource = {
            values: [[data.firstName, data.lastName, data.email, data.preferences]], // Include preferences in the data
        };

        // Append data to the spreadsheet
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range,
            valueInputOption: "RAW",
            resource,
        });

        console.log("Data saved successfully:", response.data);
    } catch (error) {
        console.error("Error saving data to Google Sheets:", error.message);
        throw new Error("Failed to save data to Google Sheets");
    }
}

// Netlify serverless function handler
exports.handler = async function(event, context) {
    try {
        // Assuming the data comes in a POST request body
        const data = JSON.parse(event.body);

        // Call the function to save data to Google Sheets
        await saveDataToGoogleSheets(data);

        // Respond with success message
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Data saved successfully" }),
        };
    } catch (error) {
        // Respond with error message
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};