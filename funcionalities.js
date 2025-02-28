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
    
    // Dimensione originale del canvas
    let originalCanvasSize = {
        width: canvas.style.width,
        height: canvas.style.height
    };

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
        if (showNames) {
            // In modalità nomi, mostra tutte le 26 persone (se esistono)
            return allNumbers
                .filter(n => n.active)
                .filter((n, idx) => idx < 26);
        } else {
            // In modalità numeri, mostra tutti i numeri attivi
            return allNumbers.filter(n => n.active);
        }
    }

    function drawWheel() {
        const activeItems = getActiveNumbers();
        const numSlices = activeItems.length;
        const sliceAngle = (2 * Math.PI) / numSlices;

        // Utilizza il rect reale per calcolare il centro e il raggio
        const rect = canvas.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Aumenta il raggio per evitare l'effetto "tagliato"
        const radius = showNames 
            ? Math.min(centerX, centerY) * 0.95
            : Math.min(centerX, centerY) * 0.90;

        ctx.clearRect(0, 0, rect.width * 2, rect.height * 2); // Pulisci l'intera area
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
                // Ridotto il font massimo per i nomi per migliorare la leggibilità
                const fontSize = Math.max(10, Math.min(14, 280 / displayText.length));
                ctx.font = `bold ${fontSize}px Montserrat`;
            } else {
                ctx.font = 'bold 20px Montserrat';
            }
            
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            
            // Se sono nomi, posiziona il testo più vicino al bordo esterno
            const textDistance = showNames ? radius - 15 : radius - 30;
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
            const progress = Math.min(elapsed / spinDuration, 1); // Assicura che non superi 1
            const easing = easeOutQuart(progress); // Cambiato a una funzione di easing più fluida

            angle = initialAngle + (totalRotation * easing);
            drawWheel();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                isSpinning = false;
                const finalAngle = angle % (2 * Math.PI);
                const activeItems = getActiveNumbers();
                const sliceAngle = (2 * Math.PI) / activeItems.length;
                const selectedIndex = Math.floor(((2 * Math.PI - finalAngle)) / sliceAngle) % activeItems.length;
                lastSelectedNumber = activeItems[selectedIndex];
                
                // Aumenta la dimensione del testo del risultato
                resultDisplay.style.fontSize = showNames ? '28px' : '24px';
                resultDisplay.style.fontWeight = 'bold';
                
                const resultText = showNames 
                    ? `È uscito/a: ${lastSelectedNumber.name}`
                    : `È uscito il numero: ${lastSelectedNumber.value}`;
                
                resultDisplay.textContent = resultText;
                const hideBtn = document.getElementById('hideNumberButton');
                if (hideBtn) hideBtn.style.display = 'inline-block';
            }
        }
        animate();
    }

    // Funzione di easing migliorata per una rotazione più fluida
    function easeOutQuart(x) {
        return 1 - Math.pow(1 - x, 4);
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

    // Funzione per adattare la dimensione della ruota in base alla visualizzazione
    function adjustWheelSize() {
        if (showNames) {
            // Aumenta la dimensione del canvas quando mostriamo i nomi
            canvas.style.width = '550px';
            canvas.style.height = '550px';
        } else {
            // Ripristina la dimensione originale
            canvas.style.width = originalCanvasSize.width;
            canvas.style.height = originalCanvasSize.height;
        }
        setupHiDPICanvas();
        drawWheel();
    }

    // Crea il pulsante per cambiare tra nomi e numeri
    function createToggleButton() {
        const toggleButton = document.getElementById('toggleNames');
        
        if (toggleButton) {
            // Rimuovi tutti gli event listener esistenti
            const newToggleButton = toggleButton.cloneNode(true);
            toggleButton.parentNode.replaceChild(newToggleButton, toggleButton);
            
            newToggleButton.addEventListener('click', () => {
                showNames = !showNames;
                newToggleButton.textContent = showNames ? 'Mostra numeri' : 'Mostra nomi';
                
                // Aggiorna prima lo stato
                if (showNames) {
                    numberList.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
                    numberEditor.style.maxWidth = '1000px';
                    addNumberBtn.style.display = 'none';
                    removeNumberBtn.style.display = 'none';
                } else {
                    numberList.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
                    numberEditor.style.maxWidth = '900px';
                    addNumberBtn.style.display = 'inline-flex';
                    removeNumberBtn.style.display = 'inline-flex';
                }
                
                // Poi aggiorna la visualizzazione
                updateNumberList();
                adjustWheelSize();
                drawWheel();
            });
        }
    }

    // Rimuovi la chiamata a createToggleButton da updateNumberList
    function updateNumberList() {
        numberList.innerHTML = '';
        // Assicurati di mostrare tutte le 26 persone in modalità nomi
        let itemsToShow = showNames ? allNumbers.slice(0, 26) : allNumbers;
        
        itemsToShow.forEach((num, index) => {
            const div = document.createElement('div');
            div.className = 'number-item';
            const displayText = showNames ? num.name : `${num.value}`;
            
            div.innerHTML = `
                <input type="checkbox" id="num${index}" ${num.active ? 'checked' : ''}>
                <label for="num${index}">${displayText}</label>
            `;
            
            const checkbox = div.querySelector('input');
            checkbox.addEventListener('change', () => {
                // Assicurati di aggiornare l'elemento corretto nell'array allNumbers
                const targetIndex = showNames ? index : index;
                allNumbers[targetIndex].active = checkbox.checked;
                hasChanges = true;
                localStorage.setItem('wheelNumbers', JSON.stringify(allNumbers));
                drawWheel();
            });
            
            numberList.appendChild(div);
        });
    }

    // Aggiungi questa chiamata dopo la definizione di tutte le funzioni
    createToggleButton();
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
    
    // Salva la dimensione originale del canvas
    originalCanvasSize = {
        width: canvas.style.width,
        height: canvas.style.height
    };
    
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
    
    // Gestione dei pulsanti footer
    const githubIcon = document.getElementById('githubIcon');
    const infoIcon = document.getElementById('infoIcon');
    const infoModal = document.getElementById('infoModal');
    const closeInfoModal = document.getElementById('closeInfoModal');
    
    // Imposta il testo del modal info
    const infoContent = document.querySelector('#infoModal p');
    if (infoContent) {
        infoContent.innerHTML = `
            La ruota della classe 3D è uno strumento utile per selezionare casualmente gli alunni da interrogare. 
            Utilizza un algoritmo che garantisce una rotazione imprevedibile, con velocità variabile ed effetto easing per un'estrazione equa.
            <br><br>
            Permette di aggiungere o rimuovere numeri in qualsiasi momento, nascondere quelli già estratti ed eventualmente ripristinare la configurazione iniziale.
            <br><br>
            Il design utilizza colori pastello ed è ottimizzato per un'interfaccia semplice e intuitiva, accessibile da qualsiasi dispositivo. 
            Se vuoi verificare anche tu, è disponibile il codice open-source su GitHub cliccando il tasto apposito.
            <br><br>
            Made by <a href="https://lollo.framer.website" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline;">lollo21</a> - v0.7.1
        `;
    }

    
    // Gestione click sul pulsante GitHub
    if (githubIcon) {
        githubIcon.addEventListener('click', () => {
            window.open('https://github.com/lollo21x/wheel', '_blank');
        });
    }
    
    // Gestione click sul pulsante Info
    if (infoIcon) {
        infoIcon.addEventListener('click', () => {
            overlay.style.display = 'block';
            infoModal.style.display = 'block';
        });
    }
    
    // Gestione chiusura modal info
    if (closeInfoModal) {
        closeInfoModal.addEventListener('click', () => {
            overlay.style.display = 'none';
            infoModal.style.display = 'none';
        });
    }
});
