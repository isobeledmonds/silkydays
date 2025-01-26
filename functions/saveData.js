require("dotenv").config();
const { google } = require("googleapis");
const fs = require("fs");
const { OAuth2 } = google.auth;

const {
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI,
    SPREADSHEET_ID,
    REFRESH_TOKEN
} = process.env;

const TOKEN_PATH = "/tmp/token.json";
const oAuth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

function initializeToken() {
    const token = {
        refresh_token: REFRESH_TOKEN,
        scope: ["https://www.googleapis.com/auth/spreadsheets"].join(" "),
        token_type: "Bearer",
        expiry_date: Date.now() + 3600 * 1000,
    };
    oAuth2Client.setCredentials(token);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
    console.log("Initialized token and saved to /tmp/token.json");
}

if (fs.existsSync(TOKEN_PATH)) {
    try {
        const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
        oAuth2Client.setCredentials(token);
        console.log("Loaded token from file:", token);
    } catch (error) {
        console.error("Error reading token file:", error.message);
        initializeToken();
    }
} else if (process.env.SAVED_TOKEN) {
    const token = JSON.parse(process.env.SAVED_TOKEN);
    oAuth2Client.setCredentials(token);
    console.log("Loaded token from environment variable.");
} else {
    console.log("Token file not found. Initializing...");
    initializeToken();
}

async function refreshAccessToken() {
    try {
        console.log("Refreshing access token...");
        const { credentials } = await oAuth2Client.refreshAccessToken();
        credentials.refresh_token = REFRESH_TOKEN; // Ensure refresh_token is retained
        oAuth2Client.setCredentials(credentials);

        fs.writeFileSync(TOKEN_PATH, JSON.stringify(credentials));
        console.log("Access token refreshed and saved.");
    } catch (error) {
        console.error("Failed to refresh access token:", error.message);
        console.log("Reinitializing token...");
        initializeToken();
    }
}

// Save data to Google Sheets
async function saveDataToGoogleSheets(data) {
    try {
        const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
        if (Date.now() >= token.expiry_date) {
            await refreshAccessToken();
        }

        const sheets = google.sheets({ version: "v4", auth: oAuth2Client });
        const range = "Sheet1!A2:D";
        const resource = { values: [[data.firstName, data.lastName, data.email, data.preferences]] };

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range,
            valueInputOption: "RAW",
            resource,
        });

        console.log("Data saved successfully.");
    } catch (error) {
        console.error("Error saving data to Google Sheets:", error.message);
        throw new Error("Failed to save data.");
    }
}

exports.handler = async function (event) {
    try {
        if (event.httpMethod !== "POST") {
            return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
        }
        const data = JSON.parse(event.body);
        await saveDataToGoogleSheets(data);
        return { statusCode: 200, body: JSON.stringify({ message: "Data saved successfully" }) };
    } catch (error) {
        console.error("Error:", error.message);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};