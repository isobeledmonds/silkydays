require("dotenv").config();
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

// File paths for storing tokens
const TOKEN_PATH = path.join(__dirname, "token.json");
const CREDENTIALS_PATH = path.join(__dirname, "credentials.json");

// Load client credentials
const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
const { client_id, client_secret, redirect_uris } = credentials.installed;

// Initialize OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
);

/**
 * Get a new token if the current token is expired or missing.
 */
const getNewToken = () => {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    console.log("Authorize this app by visiting this URL:", authUrl);

    const readline = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    readline.question("Enter the code from that page here: ", (code) => {
        readline.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) {
                console.error("Error retrieving access token", err);
                return;
            }
            saveOAuthTokens(token);
            console.log("Token stored to", TOKEN_PATH);
        });
    });
};

/**
 * Save OAuth tokens to file.
 * @param {object} token
 */
const saveOAuthTokens = (token) => {
    try {
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
        oAuth2Client.setCredentials(token);
    } catch (error) {
        console.error("Error saving OAuth tokens:", error);
    }
};

/**
 * Load tokens from file or fetch new ones if needed.
 */
const setOAuthTokens = () => {
    try {
        if (fs.existsSync(TOKEN_PATH)) {
            const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
            oAuth2Client.setCredentials(token);

            // Refresh token if expired
            oAuth2Client.on("tokens", (newToken) => {
                if (newToken.refresh_token) {
                    saveOAuthTokens(newToken);
                }
            });
        } else {
            getNewToken();
        }
    } catch (error) {
        console.error("Error setting OAuth tokens:", error);
    }
};

/**
 * Save data to Google Sheets.
 * @param {object} data - The data object containing firstName, lastName, and email.
 */
const saveDataToGoogleSheets = async (data) => {
    try {
        const sheets = google.sheets({ version: "v4", auth: oAuth2Client });
        const spreadsheetId = process.env.SPREADSHEET_ID;

        const values = [[data.firstName, data.lastName, data.email]];
        const resource = { values };

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: "Sheet1!A2", // Adjust range as needed
            valueInputOption: "RAW",
            resource,
        });

        console.log("Data saved to Google Sheets:", values);
    } catch (error) {
        console.error("Error saving data to Google Sheets:", error);
        throw new Error("Failed to save data.");
    }
};

// Initialize OAuth tokens
setOAuthTokens();

module.exports = { saveDataToGoogleSheets };