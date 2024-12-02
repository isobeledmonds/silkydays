document.addEventListener("DOMContentLoaded", () => {
    const submitButton = document.getElementById("submitButton");
    const popup = document.getElementsByClassName("popup");
    const popuptext = document.getElementsByClassName("popuptext");
    const closePopupButton = document.getElementById("closePopup");

    // Function to handle form submission
    async function handleSubmit(event) {
        event.preventDefault();

        // Collect form data
        const firstName = document.getElementById("firstName").value.trim();
        const lastName = document.getElementById("lastName").value.trim();
        const email = document.getElementById("email").value.trim();

        // Validate form data
        if (!firstName || !lastName || !email || !email.includes("@") || !email.includes(".")) {
            alert("All fields are required and email must be valid.");
            return;
        }

        try {
            // Send data to serverless function
            const response = await fetch("/.netlify/functions/saveData", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ firstName, lastName, email }),
            });

            const data = await response.json();

            if (response.ok) {
                // Show the popup
                popup.classList.add("show");
                popuptext.classList.add("show");

                // Optionally clear the form
                document.getElementById("firstName").value = "";
                document.getElementById("lastName").value = "";
                document.getElementById("email").value = "";
            } else {
                alert(`Error: ${data.error || "Unknown error occurred"}`);
            }
        } catch (error) {
            console.error("Error submitting data:", error);
            alert("An unexpected error occurred. Please try again.");
        }
    }

    // Close popup on button click
    closePopupButton.addEventListener("click", () => {
        popup.classList.remove("show");
    });

    // Add click event listener to the submit button
    submitButton.addEventListener("click", handleSubmit);
});