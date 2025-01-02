require('dotenv').config();
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const { OAuth2 } = google.auth;

const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, SPREADSHEET_ID, REFRESH_TOKEN, EMAIL_USER, EMAIL_PASS, NOTIFY_EMAIL } = process.env;

if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI || !SPREADSHEET_ID || !REFRESH_TOKEN || !EMAIL_USER || !EMAIL_PASS || !NOTIFY_EMAIL) {
    throw new Error("Missing required environment variables.");
}

const oAuth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// Function to refresh the access token if expired
async function refreshAccessToken() {
    try {
        const { credentials } = await oAuth2Client.refreshAccessToken();
        return credentials.access_token;
    } catch (error) {
        console.error('Failed to refresh access token:', error);
        await sendErrorEmail(error.message);
        throw new Error("Unable to refresh access token");
    }
}

// Function to save data to Google Sheets
async function saveDataToGoogleSheets(data) {
    try {
        let accessToken = process.env.ACCESS_TOKEN || await refreshAccessToken();
        oAuth2Client.setCredentials({ access_token: accessToken });

        const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });

        const range = "Sheet1!A2:D"; 
        const resource = {
            values: [[data.firstName, data.lastName, data.email, data.preferences]],
        };

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range,
            valueInputOption: "RAW",
            resource,
        });
        
        console.log("Data saved successfully.");
    } catch (error) {
        console.error("Error saving data to Google Sheets:", error.message);
        await sendErrorEmail(error.message);
        throw new Error("Failed to save data to Google Sheets");
    }
}

// Function to send an error email
async function sendErrorEmail(errorMessage) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: EMAIL_USER, // Your email
            pass: EMAIL_PASS, // Your email password or app-specific password
        },
    });

    let mailOptions = {
        from: EMAIL_USER,
        to: NOTIFY_EMAIL,  // The email to notify
        subject: 'Google Sheets API Error',
        text: `There was an error while saving data to Google Sheets: ${errorMessage}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Error notification sent via email.');
    } catch (error) {
        console.error('Error sending email notification:', error);
    }
}

// Netlify function handler
exports.handler = async function(event) {
    try {
        const data = JSON.parse(event.body);
        await saveDataToGoogleSheets(data);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Data saved successfully" }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};