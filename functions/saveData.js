const express = require("express");
const serverless = require("serverless-http");
const bodyParser = require("body-parser");
const { saveDataToGoogleSheets } = require("./authflow");

// Create an instance of express
const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Define the /saveData endpoint
//app.post("/saveData", async (req, res) => {
  //  const { firstName, lastName, email } = req.body;

  //  if (!firstName || !lastName || !email) {
  //      return res.status(400).json({ error: "Missing required fields" });
  //  }

 //   try {
 //      // Save data to Google Sheets
  //      await saveDataToGoogleSheets({ firstName, lastName, email });
  //      res.status(200).json({ message: "Data saved successfully" });
  //  } catch (error) {
  //      console.error("Error saving data:", error.message);
  //      res.status(500).json({ error: "Failed to save data" });
  //  }
//});

exports.handler = async function(event, context) {
    try {
      const data = JSON.parse(event.body);
      const { firstName, lastName, email } = data;
  
      // Validate input (important!)
      if (!firstName || !lastName || !email) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Missing required fields' }),
        };
      }
  
      // ... your code to save the data (e.g., database interaction) ...
  
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Data saved successfully!' }),
      };
    } catch (error) {
      console.error("Error saving data:", error); // Log the error!
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to save data'})
      }}}

// Export the handler for serverless deployment
module.exports.handler = serverless(app);