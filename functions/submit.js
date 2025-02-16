exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: "Method Not Allowed" }),
        };
    }

    try {
        const { firstName, lastName, email, preferences } = JSON.parse(event.body);

        if (!firstName || !lastName || !email || !preferences) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Missing required fields" }),
            };
        }

        // Debug: Log environment variable
        console.log("🔍 ZAPIER_WEBHOOK_URL:", process.env.ZAPIER_WEBHOOK_URL);

        if (!process.env.ZAPIER_WEBHOOK_URL) {
            throw new Error("Zapier webhook URL is not set in environment variables.");
        }

        const response = await fetch(process.env.ZAPIER_WEBHOOK_URL, {
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
        console.error("🔥 Error submitting data:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to submit data", error: error.message }),
        };
    }
};