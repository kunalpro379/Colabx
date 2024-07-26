document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let prevMouseX, prevMouseY, snapshot;
    let selectedTool = 'brush';
    let brushWidth = 5;
    let selectedColor = '#4e4e4e';
    let scale = 1;



    document.addEventListener('click', (event) => {
        if (!menuCard.contains(event.target) && event.target !== menuButton) {
            menuCard.style.display = 'none';
        }
    });

    const toolOptions = document.querySelectorAll('.tool');
    toolOptions.forEach(option => {
        option.addEventListener('click', () => {
            toolOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedTool = option.id; // Assuming each tool has an id matching the tool name
        });
    });

    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedColor = option.dataset.color; // Assuming each color option has a data attribute `data-color` with the color value
            ctx.strokeStyle = selectedColor;
            ctx.fillStyle = selectedColor;
        });
    });

    // Function to set canvas dimensions and initial background
    const setCanvasBackground = () => {
        ctx.fillStyle = '#262626'; // Background color
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = selectedColor;
    };

    // Set canvas dimensions on window load
    window.addEventListener('load', () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        setCanvasBackground();
    });

    // Function to handle mouse down event for drawing
    const startDraw = (e) => {
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
        ctx.beginPath();
        ctx.lineWidth = brushWidth;
        ctx.lineCap = 'round'; // Rounded brush stroke
        ctx.strokeStyle = selectedColor;
        ctx.fillStyle = selectedColor;
        snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    };

    // Function to handle drawing based on selected tool
    const drawing = (e) => {
        if (!isDrawing) return;

        if (selectedTool === 'pan') {
            canvas.style.cursor = 'grabbing';
            const dx = e.clientX - prevMouseX;
            const dy = e.clientY - prevMouseY;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.putImageData(snapshot, dx, dy);
            return;
        }

        ctx.putImageData(snapshot, 0, 0);

        if (selectedTool === 'brush' || selectedTool === 'eraser') {
            ctx.strokeStyle = selectedTool === 'eraser' ? '#262626' : selectedColor;
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
        } else if (selectedTool === 'rectangle') {
            drawRect(e);
        } else if (selectedTool === 'circle') {
            drawCircle(e);
        } else if (selectedTool === 'triangle') {
            drawTriangle(e);
        }
    };

    // Drawing functions for different shapes
    const drawRect = (e) => {
        const startX = Math.min(prevMouseX, e.offsetX);
        const startY = Math.min(prevMouseY, e.offsetY);
        const width = Math.abs(prevMouseX - e.offsetX);
        const height = Math.abs(prevMouseY - e.offsetY);
        ctx.beginPath();
        if (!fillColor.checked) {
            ctx.strokeRect(startX, startY, width, height);
        } else {
            ctx.fillRect(startX, startY, width, height);
        }
    };

    const drawCircle = (e) => {
        const radius = Math.sqrt(Math.pow((prevMouseX - e.offsetX), 2) + Math.pow((prevMouseY - e.offsetY), 2));
        ctx.beginPath();
        ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
        if (!fillColor.checked) {
            ctx.stroke();
        } else {
            ctx.fill();
        }
    };

    const drawTriangle = (e) => {
        ctx.beginPath();
        ctx.moveTo(prevMouseX, prevMouseY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);
        ctx.closePath();
        if (!fillColor.checked) {
            ctx.stroke();
        } else {
            ctx.fill();
        }
    };

    // Event listeners for drawing on canvas
    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', drawing);
    canvas.addEventListener('mouseup', () => {
        isDrawing = false;
        canvas.style.cursor = 'default';
    });
    canvas.addEventListener('mouseleave', () => {
        isDrawing = false;
        canvas.style.cursor = 'default';
    });

    // Tool Button Click Handlers (Assuming IDs match tool names)
    document.getElementById('pan').addEventListener('click', () => {
        selectedTool = 'pan';
        canvas.style.cursor = 'grab';
    });

    document.getElementById('brush').addEventListener('click', () => {
        selectedTool = 'brush';
        canvas.style.cursor = 'crosshair';
    });

    document.getElementById('eraser').addEventListener('click', () => {
        selectedTool = 'eraser';
        canvas.style.cursor = 'crosshair';
    });

    document.getElementById('rectangle').addEventListener('click', () => {
        selectedTool = 'rectangle';
        canvas.style.cursor = 'crosshair';
    });

    document.getElementById('circle').addEventListener('click', () => {
        selectedTool = 'circle';
        canvas.style.cursor = 'crosshair';
    });

    document.getElementById('triangle').addEventListener('click', () => {
        selectedTool = 'triangle';
        canvas.style.cursor = 'crosshair';
    });

    // Menu Interaction Code (Size slider, color picker, etc.)
    const sizeSlider = document.getElementById('sizeSlider');
    sizeSlider.addEventListener('input', () => {
        brushWidth = sizeSlider.value;
    });

    const fillColor = document.getElementById('fillColor');
    fillColor.addEventListener('change', () => {
        if (fillColor.checked) {
            fillColor.parentElement.style.backgroundColor = '#fff';
        } else {
            fillColor.parentElement.style.backgroundColor = '#262626';
        }
    });

    const colorPicker = document.getElementById('colorPicker');
    colorPicker.addEventListener('input', () => {
        selectedColor = colorPicker.value;
        ctx.strokeStyle = selectedColor;
        ctx.fillStyle = selectedColor;
    });

    const clearCanvasBtn = document.getElementById('clearCanvasBtn');
    clearCanvasBtn.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setCanvasBackground();
    });

    const saveImgBtn = document.querySelector('.save-img');
    saveImgBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = `drawing_${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
    });

    const zoomIn = () => {
        scale *= 1.1;
        canvas.style.transform = `scale(${scale})`;
    };

    const zoomOut = () => {
        scale /= 1.1;
        canvas.style.transform = `scale(${scale})`;
    };

    document.getElementById('zoomIn').addEventListener('click', zoomIn);
    document.getElementById('zoomOut').addEventListener('click', zoomOut);

});
