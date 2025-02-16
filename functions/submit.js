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

        // Replace with your Zapier Webhook URL
        const ZAPIER_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/21064230/2w9ap79/"; 

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
        console.error("Error submitting data:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to submit data" }),
        };
    }
};