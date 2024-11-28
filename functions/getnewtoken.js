const { google } = require('googleapis');
const fs = require('fs');
require('dotenv').config();

const TOKEN_PATH = '/tmp/token.json';  // Path to store the token
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN } = process.env;
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

function initializeToken() {
    const token = {
        refresh_token: REFRESH_TOKEN,
        scope: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'].join(' '),
        token_type: 'Bearer',
        expiry_date: Date.now() + 3600 * 1000  // 1 hour
    };
    oAuth2Client.setCredentials(token);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
    console.log('Initialized token from environment variables and saved to /tmp/token.json');
}

async function refreshToken() {
    try {
        const tokenResponse = await oAuth2Client.refreshAccessToken();
        const newAccessToken = tokenResponse.credentials.access_token;

        // Save the new token
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(oAuth2Client.credentials));
        console.log('Tokens refreshed and saved:', oAuth2Client.credentials);

        return {
            statusCode: 200,
            body: JSON.stringify({
                accessToken: newAccessToken,
                refreshToken: oAuth2Client.credentials.refresh_token || REFRESH_TOKEN,
            }),
        };
    } catch (error) {
        console.error('Error refreshing token:', error.message);
        return {
            statusCode: 500,
            body: `Error refreshing token: ${error.message}`,
        };
    }
}

// Main function to check and refresh token if expired
async function getNewToken() {
    if (fs.existsSync(TOKEN_PATH)) {
        try {
            const token = fs.readFileSync(TOKEN_PATH, 'utf8');
            const parsedToken = JSON.parse(token);
            const currentTime = Date.now();

            // Check if the token has expired
            if (parsedToken.expiry_date < currentTime) {
                console.log('Token expired, refreshing...');
                return await refreshToken();
            } else {
                oAuth2Client.setCredentials(parsedToken);
                console.log('Loaded valid token:', parsedToken);
                return {
                    statusCode: 200,
                    body: JSON.stringify({ message: 'Token is still valid' }),
                };
            }
        } catch (error) {
            console.error('Error reading token file:', error.message);
            return {
                statusCode: 500,
                body: `Error reading token: ${error.message}`,
            };
        }
    } else {
        console.log('Token file not found, initializing...');
        initializeToken();
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Token initialized' }),
        };
    }
}

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
        };
    }
    return await getNewToken();
};