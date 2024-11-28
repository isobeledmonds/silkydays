const { google } = require('googleapis');
require('dotenv').config();

const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN, SPREADSHEET_ID } = process.env;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
        };
    }

    try {
        const { firstName, lastName, email } = JSON.parse(event.body);

        // Set credentials with refresh token
        oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

        // Add data to Google Sheets
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1!A1:C1', // Adjust the range if needed
            valueInputOption: 'RAW',
            resource: {
                values: [
                    [firstName, lastName, email]
                ],
            },
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Data saved successfully!' }),
        };
    } catch (error) {
        console.error('Error saving data:', error.message);
        return {
            statusCode: 500,
            body: `Error saving data: ${error.message}`,
        };
    }
};