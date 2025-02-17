document.addEventListener("DOMContentLoaded", function () {
    const locationsList = [
        // List of all countries
        "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
        "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
        "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
        "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica",
        "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador",
        "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini (fmr. Swaziland)", "Ethiopia", "Fiji", "Finland", "France",
        "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
        "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
        "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
        "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar",
        "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia",
        "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)", "Namibia", "Nauru", "Nepal",
        "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan",
        "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar",
        "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia",
        "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa",
        "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan",
        "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan",
        "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City",
        "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe",
        // Provinces of Indonesia
        "Aceh, Indonesia", "Bali, Indonesia", "Banten, Indonesia", "Bengkulu, Indonesia", 
        "Central Java, Indonesia", "Central Kalimantan, Indonesia", "Central Sulawesi, Indonesia", 
        "East Java, Indonesia", "East Kalimantan, Indonesia", "East Nusa Tenggara, Indonesia",
        "Gorontalo, Indonesia", "Jakarta, Indonesia", "Jambi, Indonesia", "Lampung, Indonesia", 
        "Maluku, Indonesia", "North Kalimantan, Indonesia", "North Maluku, Indonesia", 
        "North Sulawesi, Indonesia", "North Sumatra, Indonesia", "Papua, Indonesia",
        "Riau, Indonesia", "Riau Islands, Indonesia", "Southeast Sulawesi, Indonesia", 
        "South Kalimantan, Indonesia", "South Sulawesi, Indonesia", "South Sumatra, Indonesia", 
        "West Java, Indonesia", "West Kalimantan, Indonesia", "West Nusa Tenggara, Indonesia", 
        "West Papua, Indonesia", "West Sulawesi, Indonesia", "West Sumatra, Indonesia", "Yogyakarta, Indonesia"
    ].sort(); // Sort alphabetically


   
    const datalist = document.getElementById("locations");
    const input = document.getElementById("locationInput");

    input.addEventListener("input", function () {
        const query = this.value.toLowerCase();
        datalist.innerHTML = ""; // Clear previous options

        if (query.length === 0) return; // Don't show options if input is empty

        const filteredLocations = locationsList
            .filter(location => location.toLowerCase().includes(query))
            .slice(0, 34); // Show only the first 6 matches

        filteredLocations.forEach(location => {
            let option = document.createElement("option");
            option.value = location;
            datalist.appendChild(option);
        });
    });
});