document.addEventListener("DOMContentLoaded", () => {
    const submitButton = document.getElementById("submitButton");

    submitButton.addEventListener("click", async (event) => {
        event.preventDefault();

        // Collect form data
        const firstName = document.getElementById("firstName").value.trim();
        const lastName = document.getElementById("lastName").value.trim();
        const email = document.getElementById("email").value.trim();

        // Validate form data
        if (!firstName || !lastName || !email) {
            alert("All fields are required.");
            return;
        }

        try {
            // Send data to backend
            const response = await fetch("/api/saveData", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ firstName, lastName, email }),
            });

            if (response.ok) {
                alert("Thank you! Your information has been saved.");
                // Optionally clear the form
                document.getElementById("firstName").value = "";
                document.getElementById("lastName").value = "";
                document.getElementById("email").value = "";
            } else {
                const errorData = await response.json();
                alert(`Failed to save data: ${errorData.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error submitting data:", error);
            alert("An error occurred while submitting your data. Please try again.");
        }
    });
});