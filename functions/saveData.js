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

// Set credentials with refresh token
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// **Function to Refresh Token and Handle Errors**
async function refreshAccessToken() {
    try {
        console.log("Checking if access token needs refresh...");
        
        const { credentials } = await oAuth2Client.refreshAccessToken();
        oAuth2Client.setCredentials(credentials);
        console.log("Access token refreshed successfully.");
    } catch (error) {
        console.error("Error refreshing token:", error.message);
        
        if (error.message.includes("invalid_grant")) {
            console.error("❌ Refresh token has expired or been revoked. You must generate a new one.");
        }
        
        throw new Error("Token refresh failed: " + error.message);
    }
}

// **Function to Save Data to Google Sheets**
async function saveDataToGoogleSheets(data) {
    try {
        if (!data.firstName || !data.lastName || !data.email || !data.preferences) {
            throw new Error("Invalid data: Missing required fields.");
        }

        // Ensure access token is valid before proceeding
        await refreshAccessToken();

        const sheets = google.sheets({ version: "v4", auth: oAuth2Client });
        const range = "Sheet1!A2:D";
        const resource = { values: [[data.firstName, data.lastName, data.email, data.preferences]] };

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range,
            valueInputOption: "RAW",
            resource,
        });

        console.log("✅ Data saved successfully.");
    } catch (error) {
        console.error("❌ Error saving data:", error.message);
        throw new Error("Failed to save data.");
    }
}

// **Netlify Function Handler**
exports.handler = async function (event) {
    try {
        if (event.httpMethod !== "POST") {
            return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
        }

        const data = JSON.parse(event.body);
        await saveDataToGoogleSheets(data);

        return { statusCode: 200, body: JSON.stringify({ message: "Data saved successfully" }) };
    } catch (error) {
        console.error("❌ Error handling request:", error.message);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};