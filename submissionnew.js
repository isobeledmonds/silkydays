document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("#dataForm");
    const popup = document.querySelector(".popup");
    const closePopupButton = document.getElementById("closePopup");

    // Function to show the popup
    function showPopup() {
        popup.setAttribute("id", "show"); // Show popup container
    }

    // Function to hide the popup
    function hidePopup() {
        popup.removeAttribute("id"); // Hide popup container
    }

    // Handle form submission
    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const formData = new FormData(form);
        const data = {
            firstName: formData.get("firstName"),
            lastName: formData.get("lastName"),
            email: formData.get("email"),
            preferences: formData.get("preferences"),
        };

        // Validate form data
        if (!data.firstName || !data.lastName || !data.email || !data.email.includes("@") || !data.email.includes(".")) {
            alert("All fields are required, and email must be valid.");
            return;
        }

        try {
            const response = await fetch("/.netlify/functions/saveData", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Failed to save data: " + (await response.text()));
            }

            const result = await response.json();

            // Show the popup if data is saved successfully
            if (response.ok) {
                showPopup();
            }

            // Clear the form fields
            form.reset();

            // Display a success message
            alert(result.message || "Data saved successfully!");
        } catch (error) {
            console.error("Error submitting form:", error.message);
            alert("Failed to save data. Please try again.");
        }
    });

    // Close the popup when the close button is clicked
    closePopupButton.addEventListener("click", hidePopup);
});