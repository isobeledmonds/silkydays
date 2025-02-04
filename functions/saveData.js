
require("dotenv").config();
const { google } = require("googleapis");
const { OAuth2 } = google.auth;

const {
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI,
    SPREADSHEET_ID,
    REFRESH_TOKEN
} = process.env;

const oAuth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Initialize authentication with refresh token
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// **Check Authentication**
async function checkAuth() {
    try {
        console.log("Checking Google Sheets API Authentication...");
        const sheets = google.sheets({ version: "v4", auth: oAuth2Client });

        // Simple API call to verify authentication
        const response = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
        console.log("Google Sheets API Authentication Successful.");
    } catch (error) {
        console.error("Authentication Error:", error.response?.data || error.message);
        throw new Error("Google Sheets Authentication Failed: " + JSON.stringify(error.response?.data || error.message));
    }
}

// **Refresh Access Token**
async function refreshAccessToken() {
    try {
        console.log("Refreshing Access Token...");
        const { credentials } = await oAuth2Client.refreshAccessToken();
        oAuth2Client.setCredentials(credentials);
        console.log("Access Token Refreshed Successfully.");
    } catch (error) {
        console.error("Failed to Refresh Access Token:", error.message);
        throw new Error("Token refresh error: " + JSON.stringify(error.response?.data || error.message));
    }
}

// **Save Data to Google Sheets**
async function saveDataToGoogleSheets(data) {
    try {
        // Validate data structure before proceeding
        if (!data || !data.firstName || !data.lastName || !data.email || !data.preferences) {
            console.error("Invalid Data Received:", JSON.stringify(data, null, 2));
            throw new Error("Invalid data: Missing required fields.");
        }

        console.log("Valid Data Received:", JSON.stringify(data, null, 2));

        // Check authentication before saving data
        await checkAuth();

        const sheets = google.sheets({ version: "v4", auth: oAuth2Client });
        const range = "Sheet1!A2:D";
        const resource = { values: [[data.firstName, data.lastName, data.email, data.preferences]] };

        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range,
            valueInputOption: "RAW",
            resource,
        });

        console.log("Data saved successfully:", response.data);
    } catch (error) {
        console.error("Error Saving Data to Google Sheets:", error.response?.data || error.message);
        throw new Error("Failed to save data: " + JSON.stringify(error.response?.data || error.message));
    }
}

// **Netlify Function Handler**
exports.handler = async function (event) {
    try {
        if (event.httpMethod !== "POST") {
            return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
        }

        const data = JSON.parse(event.body);

        console.log("Received Data for Saving:", JSON.stringify(data, null, 2));

        await saveDataToGoogleSheets(data);

        return { statusCode: 200, body: JSON.stringify({ message: "Data saved successfully" }) };
    } catch (error) {
        console.error("Error Handling Request:", error.message);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
