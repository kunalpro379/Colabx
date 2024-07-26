const fetch = require('node-fetch'); // Assuming you're using node-fetch for making HTTP requests

async function fetchUserData() {
    const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2ODQwOGNiZWZkZGI2ZjJiM2YxMzBiMyIsImlhdCI6MTcyMDAyNTIyMSwiZXhwIjoxNzIwMDI4ODIxfQ.6PYkneZ8tO3mXVi9Mn3QRnjANuvXNsr_mbceQndQD4A'; // Replace with your actual X-Auth-Token
    const url = 'https://localhost:3000/user'; // Replace with your actual API endpoint

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const userData = await response.json();
    const userName = userData.name;
    
    console.log(`User name: ${userName}`);

    return userName; // Returning the name or do further processing
}

fetchUserData()
    .then(name => {
        // Use the 'name' variable here as needed
        console.log(`Fetched user name: ${name}`);
    })
    .catch(error => {
        console.error('Error fetching user data:', error);
    });
