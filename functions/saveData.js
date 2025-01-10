require("dotenv").config();
const { google } = require("googleapis");
const { OAuth2 } = google.auth;

// Load environment variables
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, SPREADSHEET_ID, REFRESH_TOKEN } = process.env;

// Check if all required environment variables are set
if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI || !SPREADSHEET_ID || !REFRESH_TOKEN) {
    throw new Error("Missing required environment variables for Google OAuth.");
}

// Log the refresh token for debugging (ensure you remove this from production)
console.log("Loaded REFRESH_TOKEN:", REFRESH_TOKEN);

// OAuth2 client setup
const oAuth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Set credentials with the refresh token (log to confirm it is set)
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
console.log("Set credentials with refresh token:", REFRESH_TOKEN);

// Function to refresh the access token if expired
async function refreshAccessToken() {
    try {
        console.log("Attempting to refresh access token...");
        const { credentials } = await oAuth2Client.refreshAccessToken();
        const newAccessToken = credentials.access_token;

        console.log("New access token:", newAccessToken);

        // Temporarily store the new access token (it will persist in the current runtime)
        process.env.ACCESS_TOKEN = newAccessToken;

        return newAccessToken;
    } catch (error) {
        console.error("Error refreshing access token:", error.message);
        throw new Error("Unable to refresh access token: " + error.message);
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
        console.error("Error saving data to Google Sheets:", error);
        throw new Error("Failed to save data to Google Sheets: " + error.message);
    }
}

// Netlify serverless function handler
exports.handler = async function(event, context) {
    console.log("Incoming request:", event); // Log the incoming request

    try {
        const data = JSON.parse(event.body || "{}");
        console.log("Parsed request body:", data); // Log parsed data

        await saveDataToGoogleSheets(data);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Data saved successfully" }),
        };
    } catch (error) {
        console.error("Error handling request:", error);

        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message, stack: error.stack }),
        };
    }
};