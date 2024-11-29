const { google } = require('googleapis');

// Get the CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, and REFRESH_TOKEN from environment variables
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN } = process.env;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// SCOPES are the permissions you're requesting from the user
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'];

// Set the credentials for the OAuth2 client using the refresh token from the environment variables
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// Function to refresh the access token
async function refreshAccessToken() {
  try {
    // Attempt to refresh the access token
    const response = await oAuth2Client.refreshAccessToken();
    const newAccessToken = response.credentials.access_token;

    console.log('New access token:', newAccessToken);
    
    // Optionally, you can return the new access token in a response or store it securely

    return newAccessToken;
  } catch (error) {
    console.error('Error refreshing token:', error.message);
    return null; // Return null if there's an issue
  }
}

// Example of how to use the refreshed access token in an API request
exports.handler = async function (event, context) {
  if (event.httpMethod === 'GET') {
    try {
      // Refresh the access token
      const newAccessToken = await refreshAccessToken();

      if (newAccessToken) {
        // Use the new access token to make API requests, for example:
        oAuth2Client.setCredentials({ access_token: newAccessToken });

        // Now, you can make API requests with the refreshed access token

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Access token refreshed successfully!',
            accessToken: newAccessToken,  // Optionally return the new access token
          }),
        };
      } else {
        return {
          statusCode: 500,
          body: JSON.stringify({ message: 'Failed to refresh access token' }),
        };
      }
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Error in refreshing token', error: error.message }),
      };
    }
  }

  // If it's not a GET request, return an error
  return {
    statusCode: 405,
    body: JSON.stringify({ message: 'Method Not Allowed' }),
  };
};