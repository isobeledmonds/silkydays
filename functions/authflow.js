require("dotenv").config();
const { google } = require("googleapis");
const { OAuth2 } = google.auth;

// Validate required environment variables
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, SPREADSHEET_ID, REFRESH_TOKEN } = process.env;

if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI || !SPREADSHEET_ID || !REFRESH_TOKEN) {
    throw new Error("Missing required environment variables for Google OAuth.");
}

// Log to verify variables (optional, remove in production)
console.log("CLIENT_ID:", CLIENT_ID);
console.log("SPREADSHEET_ID:", SPREADSHEET_ID);

// OAuth2 client setup
const oAuth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Set credentials with refresh token
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// Function to save data to Google Sheets
async function saveDataToGoogleSheets(data) {
    try {
        const sheets = google.sheets({ version: "v4", auth: oAuth2Client });

        // Define the range and data
        const range = "Sheet1!A2:C"; // Adjust this based on your sheet's layout
        const resource = {
            values: [[data.firstName, data.lastName, data.email]],
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

module.exports = { saveDataToGoogleSheets };