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
            // Send data to serverless function
            const response = await fetch("/.netlify/functions/saveData", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ firstName, lastName, email }),
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message || "Data submitted successfully!");
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
    });
});