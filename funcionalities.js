document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('wheelCanvas');
    const ctx = canvas.getContext('2d');
    const spinButton = document.getElementById('spinButton');
    const editButton = document.getElementById('editButton');
    const resultDisplay = document.getElementById('result');
    const numberEditor = document.getElementById('numberEditor');
    const overlay = document.getElementById('overlay');
    const numberList = document.getElementById('numberList');
    const closeEditor = document.getElementById('closeEditor');
    const hideNumberButton = document.getElementById('hideNumberButton');
    const wheelContainer = document.querySelector('.wheel-container');
    const addNumberBtn = document.getElementById('addNumber');
    const removeNumberBtn = document.getElementById('removeNumber');
    const resetNumbers = document.getElementById('resetNumbers');

    let allNumbers = JSON.parse(localStorage.getItem('wheelNumbers')) || Array.from({ length: 26 }, (_, i) => ({
        value: i + 1,
        active: true
    }));
    let isSpinning = false;
    let angle = Math.random() * 2 * Math.PI;
    let lastSelectedNumber = null;
    let hasChanges = false;

    const pastelColors = [
        '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF',
        '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF',
        '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF',
        '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF',
        '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF',
        '#FFB3BA'
    ];

    function getActiveNumbers() {
        return allNumbers.filter(n => n.active).map(n => n.value);
    }

    function drawWheel() {
        const activeNumbers = getActiveNumbers();
        const numSlices = activeNumbers.length;
        const sliceAngle = (2 * Math.PI) / numSlices;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(angle);

        for (let i = 0; i < numSlices; i++) {
            const startAngle = i * sliceAngle;
            const endAngle = startAngle + sliceAngle;
            
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, canvas.width / 2 - 10, startAngle, endAngle);
            ctx.lineTo(0, 0);
            ctx.fillStyle = pastelColors[i % pastelColors.length];
            ctx.fill();
            ctx.stroke();
            ctx.closePath();

            ctx.save();
            ctx.rotate(startAngle + sliceAngle / 2);
            ctx.fillStyle = 'black';
            ctx.font = '20px Montserrat';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(activeNumbers[i], canvas.width / 2 - 30, 0);
            ctx.restore();
        }
        ctx.restore();
    }

    function spinWheel() {
        if (isSpinning) return;
        isSpinning = true;
        
        const hideBtn = document.getElementById('hideNumberButton');
        if (hideBtn) hideBtn.style.display = 'none';
        
        resultDisplay.textContent = '';
        
        const spinDuration = 8000 + Math.random() * 4000;
        const startTime = Date.now();
        const initialAngle = angle;
        const totalRotation = Math.random() * 4 * Math.PI + 10 * Math.PI;

        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / spinDuration;
            const easing = easeInOutCubic(progress);

            if (progress < 1) {
                angle = initialAngle + (totalRotation * easing);
                drawWheel();
                requestAnimationFrame(animate);
            } else {
                isSpinning = false;
                const finalAngle = angle % (2 * Math.PI);
                const activeNumbers = getActiveNumbers();
                const sliceAngle = (2 * Math.PI) / activeNumbers.length;
                const selectedIndex = Math.floor(((2 * Math.PI - finalAngle)) / sliceAngle) % activeNumbers.length;
                lastSelectedNumber = activeNumbers[selectedIndex];
                
                resultDisplay.textContent = `È uscito il numero: ${lastSelectedNumber}`;
                const hideBtn = document.getElementById('hideNumberButton');
                if (hideBtn) hideBtn.style.display = 'inline-block';
            }
        }
        animate();
    }

    function easeInOutCubic(x) {
        return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }

    spinButton.addEventListener('click', spinWheel);
    editButton.addEventListener('click', () => {
        overlay.style.display = 'block';
        numberEditor.style.display = 'block';
        updateNumberList();
    });

    closeEditor.addEventListener('click', () => {
        overlay.style.display = 'none';
        numberEditor.style.display = 'none';
        if (hasChanges) {
            drawWheel();
            hasChanges = false;
        }
    });

    function updateNumberList() {
        numberList.innerHTML = '';
        allNumbers.forEach((num, index) => {
            const div = document.createElement('div');
            div.className = 'number-item';
            div.innerHTML = `
                <input type="checkbox" id="num${index}" ${num.active ? 'checked' : ''}>
                <label for="num${index}">${num.value}</label>
            `;
            const checkbox = div.querySelector('input');
            checkbox.addEventListener('change', () => {
                allNumbers[index].active = checkbox.checked;
                hasChanges = true;
                localStorage.setItem('wheelNumbers', JSON.stringify(allNumbers));
            });
            numberList.appendChild(div);
        });
    }

    addNumberBtn.addEventListener('click', () => {
        const newNumber = allNumbers.length + 1;
        allNumbers.push({ value: newNumber, active: true });
        updateNumberList();
        hasChanges = true;
        localStorage.setItem('wheelNumbers', JSON.stringify(allNumbers));
    });

    removeNumberBtn.addEventListener('click', () => {
        if (allNumbers.length > 1) {
            allNumbers.pop();
            updateNumberList();
            hasChanges = true;
            localStorage.setItem('wheelNumbers', JSON.stringify(allNumbers));
        }
    });

    resetNumbers.addEventListener('click', () => {
        allNumbers = allNumbers.map(num => ({
            ...num,
            active: true
        }));
        
        updateNumberList();
        drawWheel();
        
        localStorage.setItem('wheelNumbers', JSON.stringify(allNumbers));
        
        hasChanges = true;
        
        resultDisplay.textContent = '';
        if (hideNumberButton) {
            hideNumberButton.style.display = 'none';
        }
    });

    drawWheel();

    if (hideNumberButton) {
        hideNumberButton.onclick = function() {
            if (lastSelectedNumber !== null) {
                const index = allNumbers.findIndex(n => n.value === lastSelectedNumber);
                if (index !== -1) {
                    allNumbers[index].active = false;
                    drawWheel();
                    resultDisplay.textContent = '';
                    this.style.display = 'none';
                    lastSelectedNumber = null;
                    hasChanges = true;
                    localStorage.setItem('wheelNumbers', JSON.stringify(allNumbers));
                }
            }
        };
    }
});