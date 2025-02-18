document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');
    const socket = io(); // Connect to the server
    const roomId = sessionStorage.getItem('roomId'); // This should be dynamically set based on user context

    const backgroundColor = '#262626'; // Canvas background color

    let isDrawing = false;
    let prevMouseX, prevMouseY;
    let startX, startY; // Starting points for drawing shapes
    let selectedTool = 'brush';
    let brushWidth = 5;
    let selectedColor = '#4e4e4e';
    let scale = 1;
    let shapes = []; // Array to store shapes

    // Set up canvas dimensions
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        setCanvasBackground();
        redrawShapes();
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Draw the canvas background
    function setCanvasBackground() {
        ctx.fillStyle = backgroundColor;
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

    // Store shape data
    function storeShapeData(data) {
        shapes.push(data);
        redrawShapes();
    }

    // Redraw all shapes on the canvas
    function redrawShapes() {
        setCanvasBackground(); // Reset background

        shapes.forEach(shape => {
            ctx.beginPath();
            ctx.strokeStyle = shape.color;
            ctx.lineWidth = shape.lineWidth;
            ctx.lineCap = 'round';

            if (shape.tool === 'rectangle') {
                drawRect(shape.x0, shape.y0, shape.x1, shape.y1);
            } else if (shape.tool === 'circle') {
                drawCircle(shape.x0, shape.y0, shape.x1, shape.y1);
            } else if (shape.tool === 'triangle') {
                drawTriangle(shape.x0, shape.y0, shape.x1, shape.y1);
            } else {
                ctx.moveTo(shape.x0, shape.y0);
                ctx.lineTo(shape.x1, shape.y1);
                ctx.stroke();
            }

            ctx.closePath();
        });
    }

    // Draw functions
    function drawRect(x0, y0, x1, y1) {
        const x = Math.min(x0, x1);
        const y = Math.min(y0, y1);
        const width = Math.abs(x0 - x1);
        const height = Math.abs(y0 - y1);

        ctx.strokeRect(x, y, width, height);
    }

    function drawCircle(x0, y0, x1, y1) {
        const radius = Math.sqrt(Math.pow((x0 - x1), 2) + Math.pow((y0 - y1), 2));

        ctx.arc(x0, y0, radius, 0, 2 * Math.PI);
        ctx.stroke();
    }

    function drawTriangle(x0, y0, x1, y1) {
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x0 * 2 - x1, y1);
        ctx.closePath();
        ctx.stroke();
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

        if (selectedTool === 'rectangle' || selectedTool === 'circle' || selectedTool === 'triangle') {
            startX = e.offsetX; // Starting point for shapes
            startY = e.offsetY; // Starting point for shapes
        }

        ctx.beginPath();
        ctx.lineWidth = brushWidth;
        ctx.lineCap = 'round';
        ctx.strokeStyle = selectedTool === 'eraser' ? backgroundColor : selectedColor;
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

        } else if (selectedTool === 'rectangle' || selectedTool === 'circle' || selectedTool === 'triangle') {
            // Draw the shape based on the selected tool
            ctx.strokeStyle = selectedColor;
            ctx.lineWidth = brushWidth;

            if (selectedTool === 'rectangle') {
                drawRect(startX, startY, e.offsetX, e.offsetY);
            } else if (selectedTool === 'circle') {
                drawCircle(startX, startY, e.offsetX, e.offsetY);
            } else if (selectedTool === 'triangle') {
                drawTriangle(startX, startY, e.offsetX, e.offsetY);
            }

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
            storeShapeData(drawData);
        }

        prevMouseX = e.offsetX;
        prevMouseY = e.offsetY;
    }

    // Draw on canvas when receiving data from the server
    function drawOnCanvas(data) {
        if (!data || !data.tool || !data.x0 || !data.y0 || !data.x1 || !data.y1) {
            console.error('Invalid draw data:', data);
            return;
        }

        ctx.strokeStyle = data.color;
        ctx.lineWidth = data.lineWidth;
        ctx.beginPath();

        if (data.tool === 'rectangle') {
            drawRect(data.x0, data.y0, data.x1, data.y1);
        } else if (data.tool === 'circle') {
            drawCircle(data.x0, data.y0, data.x1, data.y1);
        } else if (data.tool === 'triangle') {
            drawTriangle(data.x0, data.y0, data.x1, data.y1);
        } else {
            ctx.moveTo(data.x0, data.y0);
            ctx.lineTo(data.x1, data.y1);
            ctx.stroke();
        }

        ctx.closePath();
        storeShapeData(data); // Store the received shape data
    }

    // Listen for incoming drawing data
    socket.on('drawing', (data) => {
        drawOnCanvas(data);
    });

    // Handle clearing the canvas
    socket.on('clearCanvas', () => {
        shapes = [];
        setCanvasBackground();
    });

    // Event listeners for drawing
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', handleDrawing);
    canvas.addEventListener('mouseup', () => {
        if (selectedTool === 'rectangle' || selectedTool === 'circle' || selectedTool === 'triangle') {
            const drawData = {
                roomId: roomId,
                tool: selectedTool,
                color: selectedColor,
                lineWidth: brushWidth,
                x0: startX,
                y0: startY,
                x1: prevMouseX,
                y1: prevMouseY
            };

            socket.emit('draw', drawData);
            storeShapeData(drawData);
        }
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
        canvas.style.cursor = 'default';
        updateToolIndicator('brush');
    });

    document.getElementById('eraser').addEventListener('click', () => {
        selectedTool = 'eraser';
        canvas.style.cursor = 'default';
        updateToolIndicator('eraser');
    });

    // Event listeners for shape tools
    document.getElementById('rectangle').addEventListener('click', () => {
        selectedTool = 'rectangle';
        canvas.style.cursor = 'default';
        updateToolIndicator('rectangle');
    });

    document.getElementById('circle').addEventListener('click', () => {
        selectedTool = 'circle';
        canvas.style.cursor = 'default';
        updateToolIndicator('circle');
    });

    document.getElementById('triangle').addEventListener('click', () => {
        selectedTool = 'triangle';
        canvas.style.cursor = 'default';
        updateToolIndicator('triangle');
    });

    // Update the tool indicator
    function updateToolIndicator(tool) {
        document.querySelectorAll('.tool').forEach(el => {
            if (el.id === tool) {
                el.style.backgroundColor = '#FFD700'; // Highlight in yellow
            } else {
                el.style.backgroundColor = ''; // Reset background color
            }
        });
    }

    // Initialize the room
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
