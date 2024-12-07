require("dotenv").config();
const { google } = require("googleapis");

const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN, SPREADSHEET_ID } = process.env;

// Check that all required environment variables are present
if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI || !REFRESH_TOKEN || !SPREADSHEET_ID) {
  throw new Error("Missing required environment variables for Google OAuth.");
}

// Initialize OAuth2 client
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Set the refresh token
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// Function to save data to Google Sheets
async function saveDataToGoogleSheets(data) {
  try {
    const sheets = google.sheets({ version: "v4", auth: oAuth2Client });

    const range = "Sheet1!A2:C"; // Adjust the range as needed
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
    return response.data;
  } catch (error) {
    console.error("Error saving data to Google Sheets:", error.message);
    throw new Error("Failed to save data to Google Sheets");
  }
}

module.exports = { saveDataToGoogleSheets };