//let roomId = "668eefe5d55039aa229da856";
const userId=sessionStorage.getItem('userId_set');
uname=sessionStorage.getItem('uname')
console.log('Username:', uname);
roomId=sessionStorage.getItem('roomId');
console.log(roomId);
async function fetchMessages(roomId) {
    try {
        const response = await fetch(`/api/room_auth/${roomId}/messages`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': sessionStorage.getItem('token') // Use sessionStorage
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.messages; // Adjust according to your API response structure
    } catch (error) {
        console.error('Error fetching messages:', error.message);
        return [];
    }
}

function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hours % 12 || 12}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;
}

function displayMessage({ message, username }) {
    console.log('Displaying message:', message, 'from sender:', username);

    if (message === undefined || username === undefined) {
        console.error('Received message has undefined properties:', { message, username });
        return;
    }

    const messageElement = document.createElement('div');
    messageElement.classList.add(username === userId ? "outgoing-chats" : "received-chats");
    console.log("userId ------>",userData._id);
    console.log("username ------>",username);
    if (username === userData._id) {
        messageElement.innerHTML = `
            <div class="outgoing-chats">
             
        <div class="outgoing-msg">
                    <div class="outgoing-chats-msg">
<b style="color: white;">${username}</b>
                        <p>${message}</p>
                        <span class="time">${getCurrentTime()}</span>
                        
                    </div>
                </div>
            </div>
        `;
    } else {
        messageElement.innerHTML = `
            <div class="received-chats">
                <div class="received-msg">
                    <div class="received-msg-inbox">
                        <b style="color: white;">${username}</b>

                        <p>${message}</p>
                        <span class="time">${getCurrentTime()}</span>
                    </div>
                </div>
            </div>
        `;
    }

    chatbox.appendChild(messageElement);
    chatbox.scrollTop = chatbox.scrollHeight;
}

async function fetchUserData() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/user', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        sessionStorage.setItem('userId_set' , data._id);

        return data;
    } catch (error) {
        console.error('Error fetching user data:', error.message);
        return null;
    }
}

async function sendGroupMsg(roomId) {
    if (!roomId) {
        console.error('Room ID is not set. Cannot send message.');
        return;
    }

    const message = msg.value.trim();
    if (!message) {
        console.error('Message is empty.');
        return;
    }

    console.log(`Attempting to send message: "${message}" to room: ${roomId}`);
    try {
        const response = await fetch(`/api/room_auth/${roomId}/send_message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify({
                userId: userData._id,
                message: message
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error:', errorText);
            return;
        }

        const data = await response.json();
        console.log('Server response:', data);

        // Display the message immediately after sending
        // displayMessage({
        //     message: data.message, // Use the sent message directly
        //     username: userData._id // Ensure the username is correctly sent and received
        // });

        msg.value = ''; 

    } catch (error) {
        console.error('Error sending message:', error);
    }
}

fetchUserData().then(data => {
    userData = data;
    if (!userData) {
        console.error('Failed to fetch user data');
        return;
    }

    const socket = io();
    const sendBtn = document.getElementById("sendBtn");
    const msg = document.getElementById("msg");
    const chatbox = document.getElementById("chatbox");

    if (!sendBtn || !msg || !chatbox) {
        console.error('Required DOM elements are missing');
        return;
    }

    socket.emit('joinRoom', { userId: userData._id, roomId });

    socket.on('userConnected', (data) => {
        console.log(`User ${data.userId} joined room ${data.roomId}`);
        if (data.userId) {
            const userJoinedElement = document.createElement('div');
            userJoinedElement.classList.add("user-joined");
            userJoinedElement.innerHTML = `<b style="color: white;">${data.userId}</b> <span style="color: white;">joined the room</span>`;
            chatbox.appendChild(userJoinedElement);
            chatbox.scrollTop = chatbox.scrollHeight;
        }
    });
    

    socket.on('groupMessage', (data) => {
        console.log('Received group message:', data);
        if (data.message && data.username) {
            displayMessage(data); 
        } else {
            console.error('Received data is missing required fields:', data);
        }
    });

    sendBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const message = msg.value.trim();
        if (message) {
            console.log(`Sending message: ${message}`);
            sendGroupMsg(roomId);
        } else {
            console.error('Cannot send an empty message.');
        }
    });

    console.log("Client side script running");
});
