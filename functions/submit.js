exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: "Method Not Allowed" }),
        };
    }

    try {
        console.log("🔍 Processing submission...");

        // Retrieve Zapier webhook URL from environment variables
        const ZAPIER_WEBHOOK_URL = process.env.ZAPIER_WEBHOOK_URL;

        if (!ZAPIER_WEBHOOK_URL) {
            console.error("❌ Zapier webhook URL is not set in environment variables.");
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "Server configuration error" }),
            };
        }

        console.log("✅ ZAPIER_WEBHOOK_URL found");

        // Parse request body
        const { firstName, lastName, email, location, instagram, preferences } = JSON.parse(event.body);

        // Validation check
        if (!firstName || !lastName || !email || !preferences || !location) {
            console.error("❌ Missing required fields");
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Missing required fields" }),
            };
        }

        console.log("📤 Sending data to Zapier...");

        // Send data to Zapier
        const response = await fetch(ZAPIER_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ firstName, lastName, email, location, instagram, preferences }),
        });

        if (!response.ok) {
            throw new Error(`Zapier Webhook failed: ${response.statusText}`);
        }

        console.log("✅ Data successfully sent to Zapier");

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Data successfully sent to Zapier" }),
        };
    } catch (error) {
        console.error("🚨 Error submitting data:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to submit data" }),
        };
    }
};