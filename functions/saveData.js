require("dotenv").config();
const { google } = require("googleapis");
const fs = require("fs");
const { OAuth2 } = google.auth;

const {
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI,
    SPREADSHEET_ID,
    REFRESH_TOKEN,
} = process.env;

const oAuth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Token management in-memory (fallback for serverless environments)
let currentToken = {
    refresh_token: REFRESH_TOKEN,
    expiry_date: Date.now() + 3600 * 1000, // 1 hour from now
};

// Refresh access token dynamically
async function refreshAccessToken() {
    try {
        console.log("Refreshing access token...");
        oAuth2Client.setCredentials(currentToken); // Set the current token for refresh
        const { credentials } = await oAuth2Client.refreshAccessToken();
        currentToken = credentials; // Update the in-memory token
        console.log("Access token refreshed:", credentials);
        return credentials.access_token;
    } catch (error) {
        console.error("Error refreshing access token:", error.message);
        throw new Error("Failed to refresh access token: " + error.message);
    }
}

// Save data to Google Sheets
async function saveDataToGoogleSheets(data) {
    if (!data.firstName || !data.lastName || !data.email || !data.preferences) {
        throw new Error("Invalid data: Missing required fields.");
    }

    const sheets = google.sheets({ version: "v4", auth: oAuth2Client });

    // Check token expiry
    if (Date.now() >= currentToken.expiry_date) {
        await refreshAccessToken();
    }

    const range = "Sheet1!A2:D";
    const resource = {
        values: [[data.firstName, data.lastName, data.email, data.preferences]],
    };

    try {
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range,
            valueInputOption: "RAW",
            resource,
        });
        console.log("Data saved successfully:", response.data);
    } catch (error) {
        console.error("Google Sheets API error:", error.message);
        throw new Error("Failed to save data to Google Sheets: " + error.message);
    }
}

// Netlify function handler
exports.handler = async function (event) {
    try {
        if (event.httpMethod !== "POST") {
            return {
                statusCode: 405,
                body: JSON.stringify({ error: "Method Not Allowed" }),
            };
        }

        const data = JSON.parse(event.body);
        console.log("Received data:", data); // Debug incoming data

        await saveDataToGoogleSheets(data);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Data saved successfully" }),
        };
    } catch (error) {
        console.error("Error handling request:", error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};