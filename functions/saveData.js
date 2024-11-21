const express = require("express");
const serverless = require("serverless-http");
const bodyParser = require("body-parser");
const { saveDataToGoogleSheets } = require("../authflow");

const app = express();
app.use(bodyParser.json());

app.post("/saveData", async (req, res) => {
    try {
        const { firstName, lastName, email } = req.body;

        if (!firstName || !lastName || !email) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        await saveDataToGoogleSheets({ firstName, lastName, email });
        res.status(200).json({ message: "Data saved successfully" });
    } catch (error) {
        console.error("Error saving data:", error.message);
        res.status(500).json({ error: "Failed to save data" });
    }
});

module.exports.handler = serverless(app);