const express = require("express");
const serverless = require("serverless-http");
const bodyParser = require("body-parser");
const { saveDataToGoogleSheets } = require("./authflow");

// Create an instance of express
const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Define the /saveData endpoint
app.post("/saveData", async (req, res) => {
    const { firstName, lastName, email } = req.body;

    if (!firstName || !lastName || !email) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        // Save data to Google Sheets
        await saveDataToGoogleSheets({ firstName, lastName, email });
        res.status(200).json({ message: "Data saved successfully" });
    } catch (error) {
        console.error("Error saving data:", error.message);
        res.status(500).json({ error: "Failed to save data" });
    }
});

// Export the handler for serverless deployment
module.exports.handler = serverless(app);