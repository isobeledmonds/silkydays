require("dotenv").config();
const { google } = require("googleapis");
const { OAuth2 } = google.auth;

// Load environment variables
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, SPREADSHEET_ID, REFRESH_TOKEN } = process.env;

// Check if all required environment variables are set
if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI || !SPREADSHEET_ID || !REFRESH_TOKEN) {
    throw new Error("Missing required environment variables for Google OAuth.");
}

// OAuth2 client setup
const oAuth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// Helper function to validate access token
async function validateAccessToken(accessToken) {
    try {
        const response = await google.auth.oauth2.tokeninfo({ access_token: accessToken });
        return response.data;
    } catch (error) {
        console.warn("Access token validation failed, refreshing token...");
        return null;
    }
}

// Function to refresh the access token
async function refreshAccessToken() {
    try {
        const { credentials } = await oAuth2Client.refreshAccessToken();
        const newAccessToken = credentials.access_token;

        console.log("New access token acquired:", newAccessToken);

        // Optional: Store the new access token temporarily in memory
        process.env.ACCESS_TOKEN = newAccessToken;

        return newAccessToken;
    } catch (error) {
        console.error("Failed to refresh access token:", error.message);
        throw new Error("Unable to refresh access token");
    }
}

// Function to save data to Google Sheets
async function saveDataToGoogleSheets(data) {
    try {
        let accessToken = process.env.ACCESS_TOKEN;

        // Validate or refresh access token
        const isValidToken = accessToken ? await validateAccessToken(accessToken) : null;
        if (!isValidToken) {
            accessToken = await refreshAccessToken();
        }

        // Set the new or existing access token
        oAuth2Client.setCredentials({ access_token: accessToken });

        const sheets = google.sheets({ version: "v4", auth: oAuth2Client });

        // Define the range and data
        const range = "Sheet1!A2:D";
        const resource = {
            values: [[data.firstName, data.lastName, data.email, data.preferences]],
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
exports.handler = async function (event, context) {
    try {
        const data = JSON.parse(event.body);
        await saveDataToGoogleSheets(data);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Data saved successfully" }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};