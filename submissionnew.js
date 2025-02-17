document.addEventListener("DOMContentLoaded", () => {
    const submitButton = document.getElementById("submitButton");
    const popup = document.querySelector(".popup");
    const closePopupButton = document.getElementById("closePopup");

    // Function to show the popup
    function showPopup() {
        popup.setAttribute("id", "show"); // Show popup container
    }

    // Function to hide the popup
    function hidePopup() {
        popup.removeAttribute("id");
    }

    // Handle form submission
    async function handleSubmit(event) {
        event.preventDefault();

        // Collect form data
        const firstName = document.getElementById("firstName").value.trim();
        const lastName = document.getElementById("lastName").value.trim();
        const email = document.getElementById("email").value.trim();
        const location = document.getElementById("locationInput").value.trim(); // Get location
        const instagram = document.getElementById("instagram").value.trim(); // Get Instagram handle
        const preferences = document.getElementById("preferences").value; // Get selected value from dropdown

        // Validate form data
        if (!firstName || !lastName || !email || !email.includes("@") || !email.includes(".") || !location || !preferences) {
            alert("All fields except Instagram are required, and email must be valid.");
            return;
        }

        try {
            // Send data to Zapier Webhook
            const zapierWebhookUrl = "YOUR_ZAPIER_WEBHOOK_URL"; // Replace with your Zapier webhook URL

            const response = await fetch(zapierWebhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ firstName, lastName, email, location, instagram, preferences }),
            });

            const data = await response.json();

            if (response.ok) {
                // Show the popup
                showPopup();

                // Clear the form
                document.getElementById("firstName").value = "";
                document.getElementById("lastName").value = "";
                document.getElementById("email").value = "";
                document.getElementById("locationInput").value = "";
                document.getElementById("instagram").value = "";
                document.getElementById("preferences").value = "";
            } else {
                alert(`Error: ${data.error || "Unknown error occurred"}`);
            }
        } catch (error) {
            console.error("Error submitting data:", error);
            alert("An unexpected error occurred. Please try again.");
        }
    }

    // Event listeners
    submitButton.addEventListener("click", handleSubmit);
    closePopupButton.addEventListener("click", hidePopup);
});