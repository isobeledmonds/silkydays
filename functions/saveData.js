require("dotenv").config();
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const { OAuth2 } = google.auth;

const {
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI,
    SPREADSHEET_ID,
    REFRESH_TOKEN
} = process.env;

const TOKEN_PATH = path.resolve("/tmp/token.json");
const oAuth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Initialize token
function initializeToken() {
    const token = {
        refresh_token: REFRESH_TOKEN,
        scope: ["https://www.googleapis.com/auth/spreadsheets"].join(" "),
        token_type: "Bearer",
        expiry_date: Date.now() + 3600 * 1000,
    };
    try {
        oAuth2Client.setCredentials(token);
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
        console.log("Initialized token and saved to /tmp/token.json");
    } catch (error) {
        console.error("Failed to initialize token:", error.message);
    }
}

// Load token or initialize if not found
if (fs.existsSync(TOKEN_PATH)) {
    try {
        const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
        oAuth2Client.setCredentials(token);
        console.log("Loaded token from file:", token);
    } catch (error) {
        console.error("Error reading token file:", error.message);
        initializeToken();
    }
} else {
    console.log("Token file not found. Initializing...");
    initializeToken();
}

// Refresh the access token
async function refreshAccessToken() {
    try {
        console.log("Refreshing access token...");
        const { credentials } = await oAuth2Client.refreshAccessToken();
        oAuth2Client.setCredentials(credentials);

        fs.writeFileSync(TOKEN_PATH, JSON.stringify(credentials));
        console.log("Access token refreshed and saved:", credentials);

        return credentials.access_token;
    } catch (error) {
        console.error("Error refreshing access token:", error.message);
        throw new Error("Failed to refresh access token: " + error.message);
    }
}

// Save data to Google Sheets
async function saveDataToGoogleSheets(data) {
    try {
        if (!data.firstName || !data.lastName || !data.email || !data.preferences) {
            throw new Error("Invalid data: Missing required fields.");
        }

        const sheets = google.sheets({ version: "v4", auth: oAuth2Client });

        const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
        if (Date.now() >= token.expiry_date) {
            await refreshAccessToken();
        }

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
        console.error("Error saving data to Google Sheets:", error.message);
        throw new Error("Failed to save data to Google Sheets: " + error.message);
    }
}

// Netlify function handler
exports.handler = async function (event) {
    try {
        if (event.httpMethod !== "POST") {
            return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
        }

        const data = JSON.parse(event.body);

        console.log("Received data:", data); // Debug incoming data

        await saveDataToGoogleSheets(data);

        return { statusCode: 200, body: JSON.stringify({ message: "Data saved successfully" }) };
    } catch (error) {
        console.error("Error handling request:", error.message);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};