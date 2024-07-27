document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');
    const socket = io(); // Connect to the server
    const roomId = sessionStorage.getItem('roomId'); // This should be dynamically set based on user context

    const backgroundColor = '#262626'; // Canvas background color

    let isDrawing = false;
    let prevMouseX, prevMouseY;
    let startX, startY; // Added for rectangle drawing
    let selectedTool = 'brush';
    let brushWidth = 5;
    let selectedColor = '#4e4e4e';
    let scale = 1;

    // Set up canvas dimensions
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        setCanvasBackground();
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Draw the canvas background
    function setCanvasBackground() {
        ctx.fillStyle = backgroundColor; // Background color
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Join a room
    function joinRoom(roomId) {
        if (roomId) {
            socket.emit('joinRoomCanvas', roomId);
            console.log(`Joined room ${roomId}`);
        } else {
            console.error('No room ID specified.');
        }
    }

    // Draw a rectangle
    function drawRect(e) {
        const x = Math.min(startX, e.offsetX);
        const y = Math.min(startY, e.offsetY);
        const width = Math.abs(startX - e.offsetX);
        const height = Math.abs(startY - e.offsetY);

        ctx.beginPath();
        if (!fillColor.checked) {
            ctx.strokeRect(x, y, width, height);
        } else {
            ctx.fillRect(x, y, width, height);
        }
        ctx.closePath();
    }

    // Handle starting the drawing
    function startDrawing(e) {
        if (selectedTool === 'pan') {
            canvas.style.cursor = 'grabbing';
            prevMouseX = e.clientX;
            prevMouseY = e.clientY;
            isDrawing = true;
            return;
        }

        isDrawing = true;
        prevMouseX = e.offsetX;
        prevMouseY = e.offsetY;

        if (selectedTool === 'rectangle') {
            startX = e.offsetX; // Starting point for rectangle
            startY = e.offsetY; // Starting point for rectangle
        }

        ctx.beginPath();
        ctx.lineWidth = brushWidth;
        ctx.lineCap = 'round';
        ctx.strokeStyle = selectedTool === 'eraser' ? backgroundColor : selectedColor;
        ctx.fillStyle = selectedTool === 'eraser' ? backgroundColor : selectedColor;
    }

    // Handle the drawing action
    function handleDrawing(e) {
        if (!isDrawing) return;

        if (selectedTool === 'pan') {
            canvas.style.cursor = 'grabbing';
            const dx = e.clientX - prevMouseX;
            const dy = e.clientY - prevMouseY;
            ctx.translate(dx / scale, dy / scale);
            prevMouseX = e.clientX;
            prevMouseY = e.clientY;
            return;
        }

        if (selectedTool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out'; // Set the compositing mode to erase
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
            ctx.globalCompositeOperation = 'source-over'; // Reset to default

            // Send eraser drawing data to the server
            const drawData = {
                roomId: roomId,
                tool: 'eraser',
                color: backgroundColor,
                lineWidth: brushWidth,
                x0: prevMouseX,
                y0: prevMouseY,
                x1: e.offsetX,
                y1: e.offsetY
            };

            socket.emit('draw', drawData);

        } else if (selectedTool === 'rectangle') {
            // Draw the rectangle while the mouse is moving
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
            setCanvasBackground(); // Reset background
            drawRect(e);

            // Send rectangle drawing data to the server
            const drawData = {
                roomId: roomId,
                tool: 'rectangle',
                color: selectedColor,
                lineWidth: brushWidth,
                x0: startX,
                y0: startY,
                x1: e.offsetX,
                y1: e.offsetY,
                fillColor: fillColor.checked
            };

            socket.emit('draw', drawData);

        } else {
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();

            // Send brush drawing data to the server
            const drawData = {
                roomId: roomId,
                tool: selectedTool,
                color: selectedColor,
                lineWidth: brushWidth,
                x0: prevMouseX,
                y0: prevMouseY,
                x1: e.offsetX,
                y1: e.offsetY
            };

            socket.emit('draw', drawData);
        }

        prevMouseX = e.offsetX;
        prevMouseY = e.offsetY;
    }

    // Draw on canvas when receiving data from the server
    function drawOnCanvas(data) {
        try {
            if (!data || !data.x0 || !data.y0 || !data.x1 || !data.y1 || !data.color || !data.lineWidth || !data.tool) {
                console.error('Invalid draw data:', data);
                return;
            }

            ctx.strokeStyle = data.color;
            ctx.lineWidth = data.lineWidth;
            ctx.beginPath();

            if (data.tool === 'rectangle') {
                const x = Math.min(data.x0, data.x1);
                const y = Math.min(data.y0, data.y1);
                const width = Math.abs(data.x0 - data.x1);
                const height = Math.abs(data.y0 - data.y1);

                if (!data.fillColor) {
                    ctx.strokeRect(x, y, width, height);
                } else {
                    ctx.fillStyle = data.color;
                    ctx.fillRect(x, y, width, height);
                }
            } else if (data.tool === 'circle') {
                let radius = Math.sqrt(Math.pow((data.x0 - data.x1), 2) + Math.pow((data.y0 - data.y1), 2));
                ctx.arc(data.x0, data.y0, radius, 0, 2 * Math.PI);
                if (data.fillColor) {
                    ctx.fillStyle = data.color;
                    ctx.fill();
                } else {
                    ctx.stroke();
                }
            } else if (data.tool === 'triangle') {
                ctx.moveTo(data.x0, data.y0);
                ctx.lineTo(data.x1, data.y1);
                ctx.lineTo(data.x0 * 2 - data.x1, data.y1);
                ctx.closePath();
                if (data.fillColor) {
                    ctx.fillStyle = data.color;
                    ctx.fill();
                } else {
                    ctx.stroke();
                }
            } else {
                ctx.moveTo(data.x0, data.y0);
                ctx.lineTo(data.x1, data.y1);
                ctx.stroke();
            }

            ctx.closePath();
        } catch (error) {
            console.error('Error drawing on canvas:', error);
        }
    }

    // Listen for incoming drawing data
    socket.on('drawing', (data) => {
        drawOnCanvas(data);  
              shapes.push(data); // Store received shapes

    });

    // Event listeners for drawing
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', handleDrawing);
    canvas.addEventListener('mouseup', () => {
        isDrawing = false;
        canvas.style.cursor = 'default';
    });
    canvas.addEventListener('mouseleave', () => {
        isDrawing = false;
        canvas.style.cursor = 'default';
    });

    // Event listeners for tool selection
    document.getElementById('pan').addEventListener('click', () => {
        selectedTool = 'pan';
        canvas.style.cursor = 'grab';
        updateToolIndicator('pan');
    });

    document.getElementById('brush').addEventListener('click', () => {
        selectedTool = 'brush';
        canvas.style.cursor = 'crosshair';
        updateToolIndicator('brush');
    });

    document.getElementById('eraser').addEventListener('click', () => {
        selectedTool = 'eraser';
        canvas.style.cursor = 'crosshair';
        updateToolIndicator('eraser');
    });

    document.getElementById('rectangle').addEventListener('click', () => {
        selectedTool = 'rectangle';
        canvas.style.cursor = 'crosshair';
        updateToolIndicator('rectangle');
    });

    document.getElementById('circle').addEventListener('click', () => {
        selectedTool = 'circle';
        canvas.style.cursor = 'crosshair';
        updateToolIndicator('circle');
    });

    document.getElementById('triangle').addEventListener('click', () => {
        selectedTool = 'triangle';
        canvas.style.cursor = 'crosshair';
        updateToolIndicator('triangle');
    });

    // Handle brush size change
    const sizeSlider = document.getElementById('sizeSlider');
    sizeSlider.addEventListener('input', () => {
        brushWidth = sizeSlider.value;
    });

    // Handle color picker change
    const colorPicker = document.getElementById('colorPicker');
    colorPicker.addEventListener('input', () => {
        selectedColor = colorPicker.value;
        ctx.strokeStyle = selectedColor;
        ctx.fillStyle = selectedColor;
    });

    // Clear the canvas
    const clearCanvasBtn = document.getElementById('clearCanvasBtn');
    clearCanvasBtn.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setCanvasBackground();
    });

    // Zoom functionality
    document.getElementById('zoomIn').addEventListener('click', () => {
        scale *= 1.1;
        canvas.style.transform = `scale(${scale})`;
    });

    document.getElementById('zoomOut').addEventListener('click', () => {
        scale /= 1.1;
        canvas.style.transform = `scale(${scale})`;
    });

    // Join the room when the page loads
    joinRoom(roomId);
    
    // Update the tool indicator and highlight
    function updateToolIndicator(selected) {
        const tools = ['pan', 'brush', 'eraser', 'rectangle', 'circle', 'triangle'];
        
        tools.forEach(tool => {
            const toolBtn = document.getElementById(tool);
            if (tool === selected) {
                toolBtn.classList.add('selected');
                if (tool === 'eraser') {
                    toolBtn.style.backgroundColor = 'yellow'; // Highlight eraser in yellow
                } else {
                    toolBtn.style.backgroundColor = ''; // Reset background color for other tools
                }
            } else {
                toolBtn.classList.remove('selected');
                toolBtn.style.backgroundColor = ''; // Reset background color
            }
        });
    }
});
