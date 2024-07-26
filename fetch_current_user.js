// fetch_current_user.js

 async function getUserData() {
    try {
        const response = await fetch('/api/user/data', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const userData = await response.json();
        return userData;
    } catch (error) {
        console.error('Error fetching user data:', error.message);
        return null;
    }
}
