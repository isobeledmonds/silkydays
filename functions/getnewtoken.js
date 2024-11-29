const { google } = require('googleapis');
const dotenv = require('dotenv');
dotenv.config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    console.error("Missing required environment variables: CLIENT_ID, CLIENT_SECRET, or REDIRECT_URI");
    throw new Error("Ensure CLIENT_ID, CLIENT_SECRET, and REDIRECT_URI are properly set in your environment.");
}

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'];

exports.handler = async (event) => {
    console.log("Processing event:", event);

    if (event.httpMethod !== 'GET') {
        console.error("Invalid HTTP method used. Only GET is allowed.");
        return {
            statusCode: 405,
            body: JSON.stringify({ message: "Method Not Allowed" }),
        };
    }

    try {
        // Generate the authorization URL
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });

        console.log("Generated authorization URL:", authUrl);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Authorize this app by visiting the URL",
                authUrl,
            }),
        };
    } catch (error) {
        console.error("Error generating auth URL:", error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error generating auth URL",
                error: error.message,
            }),
        };
    }
};