document.addEventListener("DOMContentLoaded", () => {
    const submitButton = document.getElementById("submitButton");
    const popup = document.querySelector(".popup");
    const popupText = document.querySelector(".popuptext");
    const closePopupButton = document.getElementById("closePopup");

    // Function to show the popup
    function showPopup(message) {
        popupText.textContent = message; // Set the message in the popup
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

        try {
            // Simulate server response
            const response = await fetch("/.netlify/functions/saveData", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ firstName, lastName, email, preferences }), // Include preferences
            });

            const data = await response.json();

            if (response.ok) {
                // Show the popup with a success message
                showPopup("Data saved successfully!");

                // Clear the form
                document.getElementById("firstName").value = "";
                document.getElementById("lastName").value = "";
                document.getElementById("email").value = "";
                document.getElementById("preferences").value = ""; // Clear the dropdown
            } else {
                // Show the popup with an error message
                showPopup(`Error: ${data.error || "Unknown error occurred"}`);
            }
        } catch (error) {
            console.error("Error submitting data:", error);
            // Show the popup with an unexpected error message
            showPopup("An unexpected error occurred. Please try again.");
        }
    }

    // Event listeners
    submitButton.addEventListener("click", handleSubmit);
    closePopupButton.addEventListener("click", hidePopup);
});