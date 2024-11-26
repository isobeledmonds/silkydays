require('dotenv').config({ path: '/Users/isobeledmonds/Documents/GitHub/silky_days/silkydays/.env' });
const { google } = require("googleapis");
const { OAuth2 } = google.auth;


// Environment variables for Google credentials
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URIS = process.env.REDIRECT_URIS;  // Example: "urn:ietf:wg:oauth:2.0:oob"
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URIS || !SPREADSHEET_ID) {
    throw new Error("Missing required environment variables for Google OAuth.");
}

console.log("CLIENT_ID:", process.env.CLIENT_ID);
console.log("CLIENT_SECRET:", process.env.CLIENT_SECRET);
console.log("REDIRECT_URIS:", process.env.REDIRECT_URIS);
console.log("SPREADSHEET_ID:", process.env.SPREADSHEET_ID);

// OAuth2 client setup
const oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URIS);

// Function to save data to Google Sheets
async function saveDataToGoogleSheets(data) {
    try {
        // Authenticate Sheets API
        const sheets = google.sheets({ version: "v4", auth: oauth2Client });

        const range = "Sheet1!A2:C"; // Example range for your spreadsheet
        const resource = {
            values: [[data.firstName, data.lastName, data.email]],
        };

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

