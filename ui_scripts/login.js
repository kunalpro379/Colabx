document.getElementById("login-form").addEventListener("submit", async function(event) {
    event.preventDefault();
    console.log('hi bro wassup')
    console.log("Logging in user...");
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("/api/signin", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Include the token correctly
             },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            console.log("User logged in successfully");

            // Store the token in localStorage
            localStorage.setItem('token', data.token);
            console.log("Token stored:", data.token); // Log the token to the console

            // Redirect to another page or perform other actions
            window.location.href = "/room_options"; // Adjust the redirect path as needed
        } else {
            console.log("An error occurred while logging in");
            const result = await response.json();
            document.getElementById("error-msg").textContent = result.msg || "An error occurred";
            document.getElementById("error-alert").style.display = "block";
        }
    } catch (error) {
        console.log("An unexpected error occurred:", error);
        document.getElementById("error-msg").textContent = "An unexpected error occurred";
        document.getElementById("error-alert").style.display = "block";
    }
});
