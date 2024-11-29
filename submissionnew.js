document.addEventListener("DOMContentLoaded", () => {
    const submitButton = document.getElementById("submitButton");

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
                // Optionally clear the form
                document.getElementById("firstName").value = "";
                document.getElementById("lastName").value = "";
                document.getElementById("email").value = "";
                alert(data.message || "Data submitted successfully!");
            } else {
                alert(`Error: ${data.error || "Unknown error occurred"}`);
            }
        } catch (error) {
            console.error("Error submitting data:", error);
            alert("An unexpected error occurred. Please try again.");
        }
    }

    // Add click event listener to the submit button
    submitButton.addEventListener("click", handleSubmit);

    // Add event listener for "Enter" key to trigger form submission
    document.getElementById("firstName").addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            handleSubmit(event);
        }
    });
    document.getElementById("lastName").addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            handleSubmit(event);
        }
    });
    document.getElementById("email").addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            handleSubmit(event);
        }
    });
});