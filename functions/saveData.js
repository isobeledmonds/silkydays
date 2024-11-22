const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const { saveDataToGoogleSheets } = require('./authflow');  // Import the save function from authflow.js

// Create an instance of express
const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Define the /saveData endpoint
app.post('/saveData', async (req, res) => {
    // Extract first name, last name, and email from the request body
    const { firstName, lastName, email } = req.body;

    // Check if all required fields are provided
    if (!firstName || !lastName || !email) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Call the function to save the data to Google Sheets
        await saveDataToGoogleSheets({ firstName, lastName, email });

        // Respond with success message
        res.status(200).json({ message: 'Data saved successfully' });
    } catch (error) {
        console.error('Error saving data:', error.message);

        // Handle error and respond with failure message
        res.status(500).json({ error: 'Failed to save data' });
    }
});

// Export the handler function for serverless deployment
module.exports.handler = serverless(app);