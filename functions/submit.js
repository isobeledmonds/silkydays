const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = path.join(__dirname, 'token.json');

// This function loads the credentials and sets up OAuth2 client
const loadCredentials = () => {
  const credentials = {
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    redirect_uris: [process.env.REDIRECT_URI],
  };

  return new google.auth.OAuth2(
    credentials.client_id,
    credentials.client_secret,
    credentials.redirect_uris[0]
  );
};

// This function gets the token or refreshes it
const getAuthClient = async () => {
  const oAuth2Client = loadCredentials();

  if (fs.existsSync(TOKEN_PATH)) {
    const token = fs.readFileSync(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
  } else {
    // Handle the case where no token is stored yet (e.g., first run)
    console.log('Token not found, please authenticate');
  }

  return oAuth2Client;
};

// This function adds a new row to the Google Sheets
const addRowToSheet = async (auth, rowData) => {
  const sheets = google.sheets({ version: 'v4', auth });

  const spreadsheetId = process.env.SPREADSHEET_ID; // Store your spreadsheet ID in an env variable
  const range = 'Sheet1!A1:C1'; // Define the range where the data should be inserted
  const valueInputOption = 'RAW'; // Choose RAW for inserting data as it is

  const resource = {
    values: [rowData],
  };

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption,
    resource,
  });
};

// Netlify function handler
exports.handler = async (event, context) => {
  // Only handle POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Only POST requests are allowed' }),
    };
  }

  try {
    const { firstName, lastName, email } = JSON.parse(event.body);

    // Basic validation of form data
    if (!firstName || !lastName || !email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required fields' }),
      };
    }

    // Authenticate and add data to the Google Sheets
    const auth = await getAuthClient();
    const rowData = [firstName, lastName, email]; // Arrange the row data
    await addRowToSheet(auth, rowData);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Data successfully submitted to Google Sheets' }),
    };
  } catch (error) {
    console.error('Error submitting data:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to submit data' }),
    };
  }
};