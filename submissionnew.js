document.addEventListener("DOMContentLoaded", () => {
    const submitButton = document.getElementById("submitButton");
    const popup = document.querySelector(".popup");
    const popuptext = document.querySelector(".popuptext");
    const closePopupButton = document.getElementById("closePopup");

    // Function to show the popup
    function showPopup(message) {
        popuptext.textContent = message; // Update popup text
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
        const preferences = document.getElementById("preferences").value; // Get selected value from dropdown

        // Validate form data
        if (!firstName || !lastName || !email || !email.includes("@") || !email.includes(".")) {
            alert("All fields are required and email must be valid.");
            return;
        }

        if (!preferences) {
            alert("Please select a preference.");
            return;
        }

        try {
            // Simulate server response
            const response = await fetch("/.netlify/functions/saveData", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ firstName, lastName, email, preferences }), // Include preferences
            });

            const data = await response.json();

            if (response.ok) {
                // Show the popup
                showPopup("Your data has been saved successfully!");

                // Clear the form
                document.getElementById("firstName").value = "";
                document.getElementById("lastName").value = "";
                document.getElementById("email").value = "";
                document.getElementById("preferences").value = ""; // Clear the dropdown
            } else {
                showPopup(`Error: ${data.error || "Unknown error occurred"}`);
            }
        } catch (error) {
            console.error("Error submitting data:", error);
            showPopup("An unexpected error occurred. Please try again.");
        }
    }

    // Event listeners
    submitButton.addEventListener("click", handleSubmit);
    closePopupButton.addEventListener("click", hidePopup);
});