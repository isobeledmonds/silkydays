const { saveDataToGoogleSheets } = require("./authflow");

exports.handler = async function(event, context) {
    if (event.httpMethod === "POST") {
        try {
            // Parse the incoming data
            const { firstName, lastName, email } = JSON.parse(event.body);

            // Validate data
            if (!firstName || !lastName || !email) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: "Missing required fields" })
                };
            }

            // Call the function to save data to Google Sheets
            await saveDataToGoogleSheets({ firstName, lastName, email });

            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Data saved successfully" })
            };
        } catch (error) {
            console.error("Error saving data:", error.message);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Failed to save data" })
            };
        }
    } else {
        // If not a POST request
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method Not Allowed" })
        };
    }
};