exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: "Method Not Allowed" }),
        };
    }

    try {
        const { firstName, lastName, email, preferences } = JSON.parse(event.body);

        // Validation check
        if (!firstName || !lastName || !email || !preferences) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Missing required fields" }),
            };
        }

        // Get the Zapier Webhook URL from environment variables
        const ZAPIER_WEBHOOK_URL = process.env.ZAPIER_WEBHOOK_URL;

        // Debugging log to check if the env variable is being read
        console.log("🔍 ZAPIER_WEBHOOK_URL:", ZAPIER_WEBHOOK_URL ? "FOUND" : "NOT FOUND");

        if (!ZAPIER_WEBHOOK_URL) {
            throw new Error("Zapier webhook URL is not set in environment variables.");
        }

        // Send data to Zapier
        const response = await fetch(ZAPIER_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ firstName, lastName, email, preferences }),
        });

        if (!response.ok) {
            throw new Error(`Zapier Webhook failed: ${response.statusText}`);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Data successfully sent to Zapier" }),
        };
    } catch (error) {
        console.error("❌ Error submitting data:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to submit data" }),
        };
    }
};