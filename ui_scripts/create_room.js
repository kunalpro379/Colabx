async function createRoom() {
    console.log(localStorage.getItem('token'))
    try {
        const response = await fetch('/api/room_auth/create_room', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token') // Retrieve token from localStorage
            },
            body: JSON.stringify({ /* Include any necessary request body parameters */ })
        });

        if (response.ok) {
            const data = await response.json();
            // Handle success, e.g., redirect or display success message
            console.log("Room created successfully:", data);
            window.location.href = `/colabx/${data.roomId}/`; // Adjust as per your application logic
        } else {
            const errorData = await response.json();
            // Handle error, e.g., display error message
            alert(errorData.msg || 'Error creating room');
        }
    } catch (error) {
        console.error("Error:", error);
        alert('An unexpected error occurred');
    }
}
