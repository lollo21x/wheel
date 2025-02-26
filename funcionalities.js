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

    // Migliora la qualità del canvas per schermi ad alta risoluzione
    function setupHiDPICanvas() {
        const pixelRatio = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        
        canvas.width = rect.width * pixelRatio;
        canvas.height = rect.height * pixelRatio;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        
        ctx.scale(pixelRatio, pixelRatio);
    }
    
    setupHiDPICanvas();
    
    // Array con i nomi e cognomi associati ai numeri
    const namesArray = [
        "Theodore Ambrogi",
        "Lorenzo Bacalini",
        "Anamika Badial",
        "Sara Burzacca",
        "Alessia Buselli",
        "Arianna Buselli",
        "Lorenzo Cingolani",
        "Gabriele Dipasquale",
        "Alessandro Eleuteri",
        "Riccardo Gerini",
        "Mario Gulino",
        "Zhennan Hu",
        "Mariana Lopez",
        "Mose' Mariangeli",
        "Angela Mazzarella",
        "Elena Monno",
        "Federica Nocerino",
        "Riccardo Persigilli",
        "Marco Radatti",
        "Federico Romaldini",
        "Maksym Sachuk",
        "Andrea Santini",
        "Simone Tardini",
        "Davide Tonti",
        "Igli Xhepa",
        "Jiayi Xiong"
    ];

    // Aggiungi un flag per indicare se stiamo mostrando nomi o numeri
    let showNames = false;

    let allNumbers = JSON.parse(localStorage.getItem('wheelNumbers')) || Array.from({ length: 26 }, (_, i) => ({
        value: i + 1,
        name: namesArray[i] || `Person ${i+1}`,
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
        return allNumbers.filter(n => n.active);
    }

    function drawWheel() {
        const activeItems = getActiveNumbers();
        const numSlices = activeItems.length;
        const sliceAngle = (2 * Math.PI) / numSlices;

        // Utilizza il rect reale per calcolare il centro e il raggio
        const rect = canvas.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const radius = Math.min(centerX, centerY) - 10;

        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);

        for (let i = 0; i < numSlices; i++) {
            const startAngle = i * sliceAngle;
            const endAngle = startAngle + sliceAngle;
            
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius, startAngle, endAngle);
            ctx.lineTo(0, 0);
            ctx.fillStyle = pastelColors[i % pastelColors.length];
            ctx.fill();
            ctx.stroke();
            ctx.closePath();

            ctx.save();
            ctx.rotate(startAngle + sliceAngle / 2);
            ctx.fillStyle = 'black';
            
            // Determina se visualizzare nomi o numeri
            const displayText = showNames ? activeItems[i].name : activeItems[i].value.toString();
            
            // Adatta la dimensione del testo in base alla lunghezza
            if (showNames) {
                const fontSize = Math.max(10, Math.min(16, 300 / displayText.length));
                ctx.font = `${fontSize}px Montserrat`;
            } else {
                ctx.font = '20px Montserrat';
            }
            
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            
            // Se sono nomi, posiziona il testo più vicino al bordo esterno
            const textDistance = showNames ? radius - 20 : radius - 30;
            ctx.fillText(displayText, textDistance, 0);
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
                const activeItems = getActiveNumbers();
                const sliceAngle = (2 * Math.PI) / activeItems.length;
                const selectedIndex = Math.floor(((2 * Math.PI - finalAngle)) / sliceAngle) % activeItems.length;
                lastSelectedNumber = activeItems[selectedIndex];
                
                const resultText = showNames 
                    ? `È uscito: ${lastSelectedNumber.name}`
                    : `È uscito il numero: ${lastSelectedNumber.value}`;
                
                resultDisplay.textContent = resultText;
                const hideBtn = document.getElementById('hideNumberButton');
                if (hideBtn) hideBtn.style.display = 'inline-block';
            }
        }
        animate();
    }

    function easeInOutCubic(x) {
        return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }

    // Aggiungi evento click alla ruota
    wheelContainer.addEventListener('click', spinWheel);
    
    // Mantieni anche il pulsante spin per compatibilità
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

    // Crea il pulsante per cambiare tra nomi e numeri
    function createToggleButton() {
        // Controlla se il pulsante esiste già
        let toggleButton = document.getElementById('toggleNames');
        
        if (!toggleButton) {
            toggleButton = document.createElement('button');
            toggleButton.id = 'toggleNames';
            toggleButton.textContent = 'Mostra nomi';
            toggleButton.style.backgroundColor = '#9C27B0';
            
            // Aggiungi il pulsante nella sezione editor-header
            const editorHeader = document.querySelector('.editor-header');
            editorHeader.appendChild(toggleButton);
            
            toggleButton.addEventListener('click', () => {
                showNames = !showNames;
                toggleButton.textContent = showNames ? 'Mostra numeri' : 'Mostra nomi';
                
                // Nascondi o mostra i pulsanti +/- a seconda della modalità
                addNumberBtn.style.display = showNames ? 'none' : 'block';
                removeNumberBtn.style.display = showNames ? 'none' : 'block';
                
                drawWheel();
                updateNumberList();
                hasChanges = true;
            });
        }
    }

    function updateNumberList() {
        numberList.innerHTML = '';
        allNumbers.forEach((num, index) => {
            const div = document.createElement('div');
            div.className = 'number-item';
            
            const displayText = showNames ? num.name : `${num.value}`;
            
            div.innerHTML = `
                <input type="checkbox" id="num${index}" ${num.active ? 'checked' : ''}>
                <label for="num${index}">${displayText}</label>
            `;
            const checkbox = div.querySelector('input');
            checkbox.addEventListener('change', () => {
                allNumbers[index].active = checkbox.checked;
                hasChanges = true;
                localStorage.setItem('wheelNumbers', JSON.stringify(allNumbers));
            });
            numberList.appendChild(div);
        });
        
        // Assicurati che il pulsante di toggle esista
        createToggleButton();
    }

    addNumberBtn.addEventListener('click', () => {
        const newNumber = allNumbers.length + 1;
        allNumbers.push({ 
            value: newNumber, 
            name: `Person ${newNumber}`,
            active: true 
        });
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

    // Assicura compatibilità con dati esistenti
    function ensureNamesInData() {
        let needsUpdate = false;
        
        allNumbers.forEach((item, index) => {
            if (!item.hasOwnProperty('name')) {
                item.name = namesArray[index] || `Person ${index+1}`;
                needsUpdate = true;
            }
        });
        
        if (needsUpdate) {
            localStorage.setItem('wheelNumbers', JSON.stringify(allNumbers));
        }
    }
    
    ensureNamesInData();
    drawWheel();

    if (hideNumberButton) {
        hideNumberButton.onclick = function() {
            if (lastSelectedNumber !== null) {
                const index = allNumbers.findIndex(n => n.value === lastSelectedNumber.value);
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
    
    // Gestione del ridimensionamento della finestra
    window.addEventListener('resize', () => {
        setupHiDPICanvas();
        drawWheel();
    });
});
