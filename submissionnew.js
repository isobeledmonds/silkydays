let input = document.querySelector(".input");
let enterButton = document.querySelector(".enter-button");
let firstNameInput = document.querySelector(".first");
let lastNameInput = document.querySelector(".last");
let emailList = JSON.parse(localStorage.getItem("emails")) || [];
const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:4000' : 'https://silkydays.netlify.app/.netlify/functions';

// Validate email format
function validateEmail(email) {
    return email.trim() !== "" && email.includes("@") && email.includes(".");
}

// Validate first name and last name
function validateTextInput(text) {
    return text.trim() !== "";
}

// Handle enter button click
function enter() {
    let email = input.value;
    let first = firstNameInput.value;
    let last = lastNameInput.value;
    let isEmailValid = validateEmail(email);
    let isFirstNameValid = validateTextInput(first);
    let isLastNameValid = validateTextInput(last);

    console.log("Email valid:", isEmailValid, "First name valid:", isFirstNameValid, "Last name valid:", isLastNameValid);

    if (isEmailValid && isFirstNameValid && isLastNameValid) {
        enterButton.removeAttribute("disabled");

        // Store the email and names if they are valid
        if (!emailList.includes(email)) {
            emailList.push(email);
            localStorage.setItem("emails", JSON.stringify(emailList));
            localStorage.setItem("firstName", first);
            localStorage.setItem("lastName", last);
        }
    } else {
        enterButton.setAttribute("disabled", "disabled");
    }
}

// Trigger on Enter key press
input.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        enterButton.click();
    }
});

// Submit the form data to the Google Sheets API
async function submitData() {
    let email = input.value;
    let first = firstNameInput.value;
    let last = lastNameInput.value;

    if (!validateTextInput(first) || !validateTextInput(last) || !validateEmail(email)) {
        alert("Please ensure all fields are filled out correctly.");
        return;
    }

    // Create the data object
    const formData = {
        email: email,
        firstName: first,
        lastName: last
    };

    try {
        const response = await fetch(`${API_BASE_URL}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData), // Send form data to the server
        });

        if (response.ok) {
            alert('Submission successful!');
        } else {
            const errorText = await response.text();
            console.error('Error submitting data:', errorText);
            alert('Error submitting data: ' + errorText);
        }
    } catch (error) {
        console.error('Error submitting data:', error);
        alert('Error submitting data');
    }
}

// Submit the data when the enter button is clicked
enterButton.addEventListener('click', function(event) {
    event.preventDefault();
    enter();
    submitData(); // Submit data to the server
});

// Restart or clear local storage
function restart(event) {
    localStorage.clear();
}