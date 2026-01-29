document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('wheelCanvas');
    const ctx = canvas.getContext('2d');
    const spinButton = document.getElementById('spinButton');
    const editIcon = document.getElementById('editIcon');
    const resultDisplay = document.getElementById('result');
    const numberEditor = document.getElementById('numberEditor');
    const overlay = document.getElementById('overlay');
    const backIcon = document.getElementById('backIcon');
    const numberList = document.getElementById('numberList');
    const closeEditor = document.getElementById('closeEditor');
    const hideNumberButton = document.getElementById('hideNumberButton');
    const wheelContainer = document.querySelector('.wheel-container');
    const addNumberBtn = document.getElementById('addNumber');
    const removeNumberBtn = document.getElementById('removeNumber');
    const resetNumbers = document.getElementById('resetNumbers');

    // Modifica per compatibilità: Semplifica la configurazione del canvas
    function setupHiDPICanvas() {
        // Imposta dimensioni fisse più grandi per una ruota più visibile
        canvas.width = 600;
        canvas.height = 600;
    }

    setupHiDPICanvas();

    // Array con i nomi e cognomi associati ai numeri
    const namesArray = [
        "Anamika Badial",
        "Sara Burzacca",
        "Alessia Buselli",
        "Arianna Buselli",
        "Lorenzo Cingolani",
        "Gabriele Dipasquale",
        "Riccardo Gerini",
        "Mario Gulino",
        "Zhennan Hu",
        "Gaia Mancini",
        "Mose' Mariangeli",
        "Angela Mazzarella",
        "Elena Monno",
        "Federica Nocerino",
        "Riccardo Persigilli",
        "Marco Radatti",
        "Federico Romaldini",
        "Maksym Sachuk",
        "Andrea Santini",
        "Davide Tonti",
        "Igli Xhepa",
        "Jiayi Xiong"
    ];

    // Aggiungi un flag per indicare se stiamo mostrando nomi o numeri
    let showNames = true;

    // Dimensione del canvas
    const canvasSize = 600;

    // Modifica per compatibilità: Usa try-catch per gestire errori di localStorage
    let allNumbers = [];
    try {
        const storedNumbers = localStorage.getItem('wheelNumbers');
        if (storedNumbers) {
            allNumbers = JSON.parse(storedNumbers);
        } else {
            // Inizializza l'array se non esiste
            allNumbers = [];
            for (var i = 0; i < 22; i++) {
                allNumbers.push({
                    value: i + 1,
                    name: namesArray[i] || "Person " + (i + 1),
                    active: (i !== 13) // Deseleziona solo Nocerino (13)
                });
            }
        }
    } catch (e) {
        console.log("Error loading data:", e);
        // Fallback se localStorage non funziona
        allNumbers = [];
        for (var i = 0; i < 22; i++) {
            allNumbers.push({
                value: i + 1,
                name: namesArray[i] || "Person " + (i + 1),
                active: (i !== 13) // Deseleziona solo Nocerino (13)
            });
        }
    }

    let isSpinning = false;
    let angle = Math.random() * 2 * Math.PI;
    let lastSelectedNumber = null;
    let hasChanges = false;

    const pastelColors = [
        '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#9bf6ff', '#ffc6ff', '#a0c4ff',
        '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#9bf6ff', '#ffc6ff', '#a0c4ff',
        '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#9bf6ff', '#ffc6ff', '#a0c4ff',
        '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#9bf6ff'
    ];

    function getActiveNumbers() {
        // Modifica per compatibilità: Usa cicli for tradizionali invece di filter
        var active = [];
        if (showNames) {
            // In modalità nomi, mostra tutte le 22 persone (se esistono)
            for (var i = 0; i < allNumbers.length && i < 22; i++) {
                if (allNumbers[i].active) {
                    active.push(allNumbers[i]);
                }
            }
        } else {
            // In modalità numeri, mostra tutti i numeri attivi
            for (var i = 0; i < allNumbers.length; i++) {
                if (allNumbers[i].active) {
                    active.push(allNumbers[i]);
                }
            }
        }
        return active;
    }

    function drawWheel() {
        const activeItems = getActiveNumbers();
        const numSlices = activeItems.length;
        const sliceAngle = (2 * Math.PI) / numSlices;

        // Usa dimensioni fisse per il canvas
        const centerX = 300;
        const centerY = 300;

        // Usa un raggio fisso
        const radius = showNames ? 270 : 260;

        // Pulisci l'intera area con dimensioni fisse
        ctx.clearRect(0, 0, 600, 600);

        // Salva lo stato corrente del contesto
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);

        // Calculate dynamic font size based on number of slices with more conservative scaling
        const baseFontSize = showNames ? 12 : 20;
        const maxFontSize = showNames ? 18 : 28; // Reduced max font size

        // More conservative scaling formula
        let dynamicFontSize;
        if (numSlices <= 5) {
            // Still increase for very few items but more conservatively
            dynamicFontSize = Math.min(maxFontSize, baseFontSize + (22 - numSlices) * 0.8);
        } else {
            // Minimal scaling for more items
            dynamicFontSize = Math.min(maxFontSize, baseFontSize + (22 - numSlices) * 0.2);
        }

        for (var i = 0; i < numSlices; i++) {
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

            // Use dynamic font size
            ctx.font = 'bold ' + dynamicFontSize + 'px Montserrat, Arial, sans-serif';

            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';

            // Ensure text stays away from center by maintaining a minimum distance
            // This prevents text from getting too close to the center as slices get larger
            const minDistanceFromCenter = radius * 0.4; // Text will never be closer than 40% of radius from center
            const textDistance = Math.max(
                minDistanceFromCenter,
                showNames ? radius - 20 : radius - 40
            );

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
        resultDisplay.classList.remove('open');
        setTimeout(() => {
            if (!resultDisplay.classList.contains('open')) {
                resultDisplay.style.display = 'none';
            }
        }, 400);

        // Imposta un nuovo angolo iniziale casuale ad ogni giro per garantire casualità completa
        angle = Math.random() * 2 * Math.PI;

        // Aumentata la variabilità della durata per maggiore casualità (da 6 a 14 secondi)
        const spinDuration = 6000 + Math.random() * 8000;
        const startTime = Date.now();
        const initialAngle = angle;
        // Aumentato significativamente il range di rotazione per maggiore casualità
        // Range da 8π (4 giri) a 20π (10 giri) invece di 10π-14π
        const totalRotation = Math.random() * 12 * Math.PI + 8 * Math.PI;

        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / spinDuration, 1);
            const easing = easeOutQuart(progress);

            angle = initialAngle + (totalRotation * easing);

            // Use requestAnimationFrame for smoother animation
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                isSpinning = false;
                const finalAngle = angle % (2 * Math.PI);
                const activeItems = getActiveNumbers();
                const sliceAngle = (2 * Math.PI) / activeItems.length;
                const selectedIndex = Math.floor(((2 * Math.PI - finalAngle)) / sliceAngle) % activeItems.length;
                lastSelectedNumber = activeItems[selectedIndex];

                const resultText = showNames
                    ? "È uscito/a: " + lastSelectedNumber.name
                    : "È uscito il numero: " + lastSelectedNumber.value;

                resultDisplay.textContent = resultText;
                resultDisplay.style.display = 'block';
                // Force reflow
                void resultDisplay.offsetWidth;
                resultDisplay.classList.add('open');
                const hideBtn = document.getElementById('hideNumberButton');
                if (hideBtn) hideBtn.style.display = 'inline-block';
            }
            drawWheel();
        }

        // Start the animation with requestAnimationFrame
        requestAnimationFrame(animate);
    }

    // Optimize the easing function
    function easeOutQuart(x) {
        return 1 - Math.pow(1 - x, 4);
    }

    // Aggiungi evento click alla ruota
    wheelContainer.addEventListener('click', spinWheel);

    // Mantieni anche il pulsante spin per compatibilità
    spinButton.addEventListener('click', spinWheel);

    editIcon.addEventListener('click', function () {
        overlay.style.display = 'block';
        numberEditor.style.display = 'block';
        updateNumberList();
    });

    closeEditor.addEventListener('click', function () {
        overlay.style.display = 'none';
        numberEditor.style.display = 'none';
        if (hasChanges) {
            drawWheel();
            hasChanges = false;
        }
    });

    // Funzione per adattare la dimensione della ruota in base alla visualizzazione
    function adjustWheelSize() {
        canvas.width = 600;
        canvas.height = 600;
        drawWheel();
    }

    // Crea il pulsante per cambiare tra nomi e numeri
    function createToggleButton() {
        const toggleButton = document.getElementById('toggleNames');

        if (toggleButton) {
            // Rimuovi tutti gli event listener esistenti
            const newToggleButton = toggleButton.cloneNode(true);
            toggleButton.parentNode.replaceChild(newToggleButton, toggleButton);

            // Imposta il testo iniziale corretto
            newToggleButton.textContent = showNames ? 'Mostra numeri' : 'Mostra nomi';

            newToggleButton.addEventListener('click', function () {
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

    // Applica gli stili iniziali in base a showNames
    function applyInitialStyles() {
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
    }

    // Rimuovi la chiamata a createToggleButton da updateNumberList
    function updateNumberList() {
        numberList.innerHTML = '';
        // Assicurati di mostrare tutte le 22 persone in modalità nomi
        var itemsToShow = showNames ? allNumbers.slice(0, 22) : allNumbers;

        for (var i = 0; i < itemsToShow.length; i++) {
            var num = itemsToShow[i];
            var index = i;

            var div = document.createElement('div');
            div.className = 'number-item';
            var displayText = showNames ? num.name : "" + num.value;

            div.innerHTML =
                '<input type="checkbox" id="num' + index + '" ' + (num.active ? 'checked' : '') + '>' +
                '<label for="num' + index + '">' + displayText + '</label>';

            // Usa una closure per mantenere il riferimento corretto all'indice
            (function (idx) {
                var checkbox = div.querySelector('input');
                checkbox.addEventListener('change', function () {
                    // Assicurati di aggiornare l'elemento corretto nell'array allNumbers
                    var targetIndex = showNames ? idx : idx;
                    allNumbers[targetIndex].active = checkbox.checked;
                    hasChanges = true;
                    try {
                        localStorage.setItem('wheelNumbers', JSON.stringify(allNumbers));
                    } catch (e) {
                        console.log("Error saving to localStorage:", e);
                    }
                    drawWheel();
                });
            })(index);

            numberList.appendChild(div);
        }
    }

    // Aggiungi questa chiamata dopo la definizione di tutte le funzioni
    createToggleButton();
    applyInitialStyles();

    addNumberBtn.addEventListener('click', function () {
        var newNumber = allNumbers.length + 1;
        allNumbers.push({
            value: newNumber,
            name: "Person " + newNumber,
            active: true
        });
        updateNumberList();
        hasChanges = true;
        try {
            localStorage.setItem('wheelNumbers', JSON.stringify(allNumbers));
        } catch (e) {
            console.log("Error saving to localStorage:", e);
        }
    });

    removeNumberBtn.addEventListener('click', function () {
        if (allNumbers.length > 1) {
            allNumbers.pop();
            updateNumberList();
            hasChanges = true;
            try {
                localStorage.setItem('wheelNumbers', JSON.stringify(allNumbers));
            } catch (e) {
                console.log("Error saving to localStorage:", e);
            }
        }
    });

    resetNumbers.addEventListener('click', function () {
        // Usa un ciclo for tradizionale invece di map
        for (var i = 0; i < allNumbers.length; i++) {
            // Mantieni solo Federica Nocerino (indice 13) non selezionata
            allNumbers[i].active = (i !== 13);
        }

        updateNumberList();
        drawWheel();

        try {
            localStorage.setItem('wheelNumbers', JSON.stringify(allNumbers));
        } catch (e) {
            console.log("Error saving to localStorage:", e);
        }

        hasChanges = true;

        resultDisplay.textContent = '';
        resultDisplay.classList.remove('open');
        setTimeout(() => {
            if (!resultDisplay.classList.contains('open')) {
                resultDisplay.style.display = 'none';
            }
        }, 400);
        if (hideNumberButton) {
            hideNumberButton.style.display = 'none';
        }
    });

    // Assicura compatibilità con dati esistenti
    function ensureNamesInData() {
        var needsUpdate = false;

        for (var i = 0; i < allNumbers.length; i++) {
            if (!allNumbers[i].hasOwnProperty('name')) {
                allNumbers[i].name = namesArray[i] || "Person " + (i + 1);
                needsUpdate = true;
            }
        }

        if (needsUpdate) {
            try {
                localStorage.setItem('wheelNumbers', JSON.stringify(allNumbers));
            } catch (e) {
                console.log("Error saving to localStorage:", e);
            }
        }
    }

    ensureNamesInData();

    // Salva la dimensione originale del canvas
    originalCanvasSize = {
        width: "500px",
        height: "500px"
    };

    drawWheel();

    if (hideNumberButton) {
        hideNumberButton.onclick = function () {
            if (lastSelectedNumber !== null) {
                // Usa un ciclo for tradizionale per trovare l'indice
                var index = -1;
                for (var i = 0; i < allNumbers.length; i++) {
                    if (allNumbers[i].value === lastSelectedNumber.value) {
                        index = i;
                        break;
                    }
                }

                if (index !== -1) {
                    allNumbers[index].active = false;
                    drawWheel();
                    resultDisplay.textContent = '';
                    resultDisplay.classList.remove('open');
                    setTimeout(() => {
                        if (!resultDisplay.classList.contains('open')) {
                            resultDisplay.style.display = 'none';
                        }
                    }, 400);
                    this.style.display = 'none';
                    lastSelectedNumber = null;
                    hasChanges = true;
                    try {
                        localStorage.setItem('wheelNumbers', JSON.stringify(allNumbers));
                    } catch (e) {
                        console.log("Error saving to localStorage:", e);
                    }
                }
            }
        };
    }

    if (backIcon) {
        backIcon.addEventListener('click', function () {
            window.location.href = 'https://hub4d.lollo.dpdns.org';
        });
    }

    // Gestione del ridimensionamento della finestra - semplificata
    window.addEventListener('resize', function () {
        canvas.width = 600;
        canvas.height = 600;
        drawWheel();
    });

    // --- CLOCK & PILL LOGIC ---
    let serverTimeOffset = 0;

    async function syncWithTimeApi() {
        try {
            console.log('Syncing time...');
            const requestStartTime = Date.now();
            const response = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=Europe/Rome', {
                method: 'GET', headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            const data = await response.json();
            const requestEndTime = Date.now();
            const latency = (requestEndTime - requestStartTime) / 2;
            const serverTime = new Date(data.dateTime);
            const localTime = new Date();
            serverTimeOffset = serverTime.getTime() - localTime.getTime() + latency;
            console.log('Time synced. Offset:', serverTimeOffset, 'ms');
        } catch (error) {
            console.error('Time sync error:', error);
            // Fallback: silent fail, keeps using local time (offset 0)
        }
    }

    function updateClock() {
        const now = new Date(Date.now() + serverTimeOffset);
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const clockTimeElement = document.getElementById('clockTime');
        if (clockTimeElement) {
            clockTimeElement.textContent = `${hours}:${minutes}`;
        }
        requestAnimationFrame(updateClock);
    }

    // Start sync and clock
    syncWithTimeApi();
    updateClock();

    // Clock Pill Redirect
    const clockPill = document.getElementById('clockPill');
    if (clockPill) {
        clockPill.addEventListener('click', () => {
            window.location.href = 'https://clock4d.lollo.dpdns.org';
        });
    }

    // --- MODAL ANIMATION FUNCTIONS ---
    function openModal(modal) {
        if (!modal) return;
        overlay.style.display = 'block';
        modal.style.display = 'block';

        // Force reflow
        void modal.offsetWidth;

        overlay.classList.add('open');
        modal.classList.add('open');
    }

    function closeModal(modal) {
        if (!modal) return;
        overlay.classList.remove('open');
        modal.classList.remove('open');

        setTimeout(() => {
            overlay.style.display = 'none';
            modal.style.display = 'none';
        }, 400); // Wait for transition
    }


    // Gestione dei pulsanti footer
    var githubIcon = document.getElementById('githubIcon');
    var infoIcon = document.getElementById('infoIcon');
    var infoModal = document.getElementById('infoModal');
    var closeInfoModal = document.getElementById('closeInfoModal');

    // Imposta il testo del modal info
    var infoContent = document.querySelector('#infoModal p');
    if (infoContent) {
        infoContent.innerHTML =
            'La ruota della classe 4D è uno strumento utile per selezionare casualmente gli alunni da interrogare. ' +
            'Utilizza un algoritmo che garantisce una rotazione imprevedibile, con velocità variabile ed effetto easing per un\'estrazione equa.' +
            '<br><br>' +
            'Permette di aggiungere o rimuovere numeri in qualsiasi momento, nascondere quelli già estratti ed eventualmente ripristinare la configurazione iniziale.' +
            '<br><br>' +
            'Il design utilizza colori pastello ed è ottimizzato per un\'interfaccia semplice e intuitiva, accessibile da qualsiasi dispositivo. ' +
            'Se vuoi verificare anche tu, è disponibile il codice open-source su GitHub cliccando il tasto apposito.' +
            '<br><br>' +
            'Se hai dei dubbi sulla casualità della rucola, ecco la <a href="https://telegra.ph/La-casualità-nella-ruota-della-fortuna-della-3D-come-funziona-03-06" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline;">spiegazione del codice</a>.' +
            '<br><br>' +
            'Fatta da <a href="https://lollo.dpdns.org/" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline;">lollo21</a> - v2.7';
    }

    // Gestione click sul pulsante GitHub
    if (githubIcon) {
        githubIcon.addEventListener('click', function () {
            window.open('https://github.com/lollo21x/wheel', '_blank');
        });
    }

    // Gestione click sul pulsante Info
    if (infoIcon) {
        infoIcon.addEventListener('click', function () {
            openModal(infoModal);
        });
    }

    // Gestione chiusura modal info
    if (closeInfoModal) {
        closeInfoModal.addEventListener('click', function () {
            closeModal(infoModal);
        });
    }

    // Chiudi modal cliccando sull'overlay
    overlay.addEventListener('click', function () {
        if (numberEditor.style.display === 'block') {
            closeModal(numberEditor);
            if (hasChanges) {
                drawWheel();
                hasChanges = false;
            }
        }
        if (infoModal.style.display === 'block') {
            closeModal(infoModal);
        }
    });

    // Replace edit icon listener
    editIcon.addEventListener('click', function () {
        updateNumberList();
        openModal(numberEditor);
    });

    // Replace close editor listener
    closeEditor.addEventListener('click', function () {
        closeModal(numberEditor);
        if (hasChanges) {
            drawWheel();
            hasChanges = false;
        }
    });
});
