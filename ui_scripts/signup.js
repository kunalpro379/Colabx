        document.getElementById("register-form").addEventListener("submit", async function(event) {
            event.preventDefault();
            console.log("Registering user...");
            const name = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            try {
                const response = await fetch("/api/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password })
                });

                if (response.ok) {
                    console.log("User registered successfully! Redirecting to login page...");
                    window.location.href = "/login";
                } else {
                    console.log("An error occurred while registering the user");
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