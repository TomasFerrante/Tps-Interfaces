// ========================================================================================
// BLOCKA GAME - League of Legends Puzzle Game
// Sistema completo: Slot Machine + Rompecabezas con rotación
// ========================================================================================

// ========================================================================================
// CLASE BUTTON - Para botones dibujados en el canvas
// ========================================================================================

class Button {
    constructor(x, y, width, height, text, callback, color = '#03ad56', hoverColor = '#74e0a9') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text;
        this.callback = callback;
        this.color = color;
        this.hoverColor = hoverColor;
        this.isHovered = false;
        this.icon = null; // Material icon opcional
    }

    setIcon(icon) {
        this.icon = icon;
        return this;
    }

    draw(ctx) {
        // Fondo del botón con gradiente
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        if (this.isHovered) {
            gradient.addColorStop(0, this.hoverColor);
            gradient.addColorStop(1, this.color);
        } else {
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(1, this.color + 'cc');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, 25);
        ctx.fill();

        // Sombra para efecto 3D
        if (this.isHovered) {
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 5;
        }

        // Borde
        ctx.strokeStyle = this.isHovered ? '#ffffff' : this.color + '44';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Resetear sombra
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Texto
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px "Titillium Web", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const textY = this.y + this.height / 2;

        if (this.icon) {
            // Si hay icono, dibujarlo a la izquierda del texto
            ctx.font = 'normal 24px "Material Symbols Outlined"';
            const iconWidth = ctx.measureText(this.icon).width;
            const textWidth = ctx.measureText(this.text).width;
            const totalWidth = iconWidth + textWidth + 10;

            ctx.fillText(this.icon, this.x + this.width / 2 - totalWidth / 2 + iconWidth / 2, textY);
            ctx.font = 'bold 20px "Titillium Web", sans-serif';
            ctx.fillText(this.text, this.x + this.width / 2 + totalWidth / 2 - textWidth / 2, textY);
        } else {
            ctx.fillText(this.text, this.x + this.width / 2, textY);
        }
    }

    isPointInside(x, y) {
        return x >= this.x && x <= this.x + this.width &&
               y >= this.y && y <= this.y + this.height;
    }

    handleClick() {
        if (this.callback) {
            this.callback();
        }
    }
}

// ========================================================================================
// CONSTANTES Y CONFIGURACIÓN
// ========================================================================================

const championImages = [
    '../assets/images/Ashe_0.jpg',
    '../assets/images/Aspecto_centrado_-_Gangplank_Base.webp',
    '../assets/images/Jhin_5.webp',
    '../assets/images/Teemo_0.jpg',
    '../assets/images/Veigar_0.jpg',
    '../assets/images/Azir_0.jpg',
    '../assets/images/Leblanc_0.jpg',
    '../assets/images/Sett_0.jpg',
    '../assets/images/Karma_0.jpg',
    '../assets/images/LeeSin_0.jpg',
    '../assets/images/Nautilus_0.jpg'
];

const CANVAS_WIDTH = 1340;
const CANVAS_HEIGHT = 507;

// Área de juego (cuadrada y centrada) - Agrandada para mejor visibilidad
const GAME_SIZE = 450; // Aumentado para piezas más grandes (especialmente 8 piezas)
const GAME_AREA_X = (CANVAS_WIDTH - GAME_SIZE) / 2;
const GAME_AREA_Y = (CANVAS_HEIGHT - GAME_SIZE) / 2;
const GAME_AREA_WIDTH = GAME_SIZE;
const GAME_AREA_HEIGHT = GAME_SIZE;

// Configuración del slot machine
const SLOT_COLUMNS = 6;
const SLOT_SPIN_DURATION = 2100; // ms inicial antes de detener
const SLOT_COLUMN_DELAY = 300; // ms entre columnas
const REEL_COUNT = 6;
const REEL_STOP_DURATION = SLOT_SPIN_DURATION;
const LAST_REEL_STOP_TIME = REEL_STOP_DURATION + (REEL_COUNT - 1) * SLOT_COLUMN_DELAY;

// ========================================================================================
// VARIABLES GLOBALES
// ========================================================================================

let canvas, ctx;
let currentGameState = 'START'; // START, INSTRUCTIONS, SLOT, DIFFICULTY, PUZZLE, VICTORY, DEFEAT
let currentChampionImage = null;
let selectedDifficulty = 4;
let puzzlePieces = [];
let timerInterval = null;
let startTime = 0;
let elapsedTime = 0;
let timePenalty = 0; // Penalización de tiempo acumulada (en ms)
let puzzleCompleted = false;
let helpUsed = 0; // Contador de ayudas usadas
let maxHelps = 3; // Máximo de ayudas permitidas
let maxTime = 0; // Tiempo máximo en milisegundos (0 = sin límite)

// Slot machine
let slotReels = [];
let isSlotSpinning = false;
let jackpotAudio = null; // Audio del slot machine
let leverPulled = false;
let leverAnimationProgress = 0;
let winningSymbol = null;
let slotMessage = '';
let showWinMessage = false;
let flashOverlayActive = false;
let winGlowActive = false;
let reelsShaking = false;
let slotAnimationFrame = null;

// Sistema de botones
let currentButtons = [];
let hoveredButton = null;

// Precarga de imágenes
let championImagesLoaded = [];
let imagesLoaded = false;

// ========================================================================================
// ELEMENTOS DOM
// ========================================================================================

const menuGame = document.getElementById('menu-game');

// ========================================================================================
// INICIALIZACIÓN
// ========================================================================================

function init() {
    canvas = document.getElementById('canvas-game');
    ctx = canvas.getContext('2d');

    // Inicializar audio del slot machine
    jackpotAudio = new Audio('../assets/Slot Machine Jackpot Sound Effect.mp3');
    jackpotAudio.volume = 0.5;

    // Precargar todas las imágenes de campeones
    preloadChampionImages();

    setupEventListeners();
    showScreen('START');
}

function preloadChampionImages() {
    let loadedCount = 0;
    const totalImages = championImages.length;

    championImages.forEach((src, index) => {
        const img = new Image();
        img.onload = () => {
            loadedCount++;
            if (loadedCount === totalImages) {
                imagesLoaded = true;
            }
        };
        img.onerror = () => {
            console.error(`Error cargando imagen: ${src}`);
            loadedCount++;
            if (loadedCount === totalImages) {
                imagesLoaded = true;
            }
        };
        img.src = src;
        championImagesLoaded[index] = img;
    });
}

function setupEventListeners() {
    // Clicks y movimiento del mouse en el canvas
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('contextmenu', handleCanvasRightClick);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
}

// ========================================================================================
// GESTIÓN DE PANTALLAS
// ========================================================================================

function showScreen(screen) {
    currentGameState = screen;
    currentButtons = [];
    hoveredButton = null;

    // Limpiar el canvas
    clearCanvas();

    // Dibujar la pantalla correspondiente
    switch(screen) {
        case 'START':
            drawStartScreen();
            break;
        case 'INSTRUCTIONS':
            drawInstructionsScreen();
            break;
        case 'SLOT':
            // La animación de slot se maneja en animateSlot()
            break;
        case 'DIFFICULTY':
            drawDifficultyScreen();
            break;
        case 'PUZZLE':
            drawPuzzle();
            drawPuzzleHUD();
            break;
        case 'VICTORY':
            drawVictoryScreen();
            break;
        case 'DEFEAT':
            drawDefeatScreen();
            break;
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Fondo con gradiente
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#100527');
    gradient.addColorStop(0.5, '#3a0477');
    gradient.addColorStop(1, '#100527');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

// ========================================================================================
// PANTALLAS DEL JUEGO
// ========================================================================================

function drawStartScreen() {
    clearCanvas();

    // Título
    ctx.font = 'bold 48px "Titillium Web", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Gradiente para el título
    const titleGradient = ctx.createLinearGradient(0, 150, 0, 200);
    titleGradient.addColorStop(0, '#03ad56');
    titleGradient.addColorStop(1, '#74e0a9');
    ctx.fillStyle = titleGradient;
    ctx.fillText('BLOCKA LEAGUE OF LEGENDS', CANVAS_WIDTH / 2, 180);

    // Subtítulo
    ctx.font = '24px "Titillium Web", sans-serif';
    ctx.fillStyle = '#e2e0e0';
    ctx.fillText('¡Resuelve el rompecabezas de tu campeón favorito!', CANVAS_WIDTH / 2, 240);

    // Botones
    const btnInstructions = new Button(
        CANVAS_WIDTH / 2 - 250,
        320,
        220,
        60,
        'Instrucciones',
        () => showScreen('INSTRUCTIONS'),
        '#5603ad',
        '#8a38f5'
    );

    const btnPlay = new Button(
        CANVAS_WIDTH / 2 + 30,
        320,
        220,
        60,
        'Jugar',
        () => startSlotAnimation(),
        '#03ad56',
        '#74e0a9'
    );

    currentButtons.push(btnInstructions, btnPlay);
    currentButtons.forEach(btn => btn.draw(ctx));
}

function drawInstructionsScreen() {
    clearCanvas();

    // Título centrado
    ctx.font = 'bold 40px "Titillium Web", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#03ad56';
    ctx.fillText('¿Cómo jugar?', CANVAS_WIDTH / 2, 60);

    // Instrucciones centradas
    const instructions = [
        'Fase 1 - Slot: Las columnas girarán y revelarán un campeón aleatorio',
        'Fase 2 - Selección: Elige la dificultad (4, 6 u 8 piezas)',
        'Fase 3 - Rompecabezas: Rota las piezas para completar la imagen',
        'Click Izquierdo: Rota la pieza a la izquierda (90°)',
        'Click Derecho: Rota la pieza a la derecha (90°)',
        'Botón Ayuda: Coloca una pieza correcta (máximo 3 ayudas)'
    ];

    ctx.font = '20px "Titillium Web", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#e2e0e0';

    let y = 130;
    instructions.forEach((instruction, index) => {
        const text = `${index + 1}. ${instruction}`;
        ctx.fillText(text, CANVAS_WIDTH / 2, y);
        y += 45;
    });

    // Botón de volver centrado
    const btnBack = new Button(
        CANVAS_WIDTH / 2 - 110,
        400,
        220,
        60,
        'Volver',
        () => showScreen('START'),
        '#101017',
        '#5603ad'
    );

    currentButtons.push(btnBack);
    btnBack.draw(ctx);
}

function drawDifficultyScreen() {
    clearCanvas();

    // Título
    ctx.font = 'bold 40px "Titillium Web", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#03ad56';
    ctx.fillText('Selecciona la Dificultad', CANVAS_WIDTH / 2, 100);

    // Botones de dificultad más anchos
    const buttonWidth = 240;
    const buttonHeight = 160;
    const buttonGap = 50; // Más espacio entre botones
    const totalWidth = (buttonWidth * 3) + (buttonGap * 2);
    const startX = (CANVAS_WIDTH - totalWidth) / 2;

    const btnEasy = new Button(
        startX,
        180,
        buttonWidth,
        buttonHeight,
        '', // Sin texto en el botón
        () => startPuzzle(4),
        '#5603ad',
        '#8a38f5'
    );

    const btnMedium = new Button(
        startX + buttonWidth + buttonGap,
        180,
        buttonWidth,
        buttonHeight,
        '', // Sin texto en el botón
        () => startPuzzle(6),
        '#5603ad',
        '#8a38f5'
    );

    const btnHard = new Button(
        startX + (buttonWidth + buttonGap) * 2,
        180,
        buttonWidth,
        buttonHeight,
        '', // Sin texto en el botón
        () => startPuzzle(8),
        '#5603ad',
        '#8a38f5'
    );

    const labels = ['Fácil', 'Medio', 'Difícil'];

    // Dibujar contenido de cada botón
    [btnEasy, btnMedium, btnHard].forEach((btn, index) => {
        btn.draw(ctx);

        // Título del botón (arriba)
        ctx.font = 'bold 22px "Titillium Web", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(labels[index], btn.x + btn.width / 2, btn.y + 35);

        // Número de piezas (centro)
        ctx.font = 'bold 70px "Titillium Web", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText([4, 6, 8][index], btn.x + btn.width / 2, btn.y + 95);

        // Texto "Piezas" (abajo)
        ctx.font = 'bold 18px "Titillium Web", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText('piezas', btn.x + btn.width / 2, btn.y + 135);
    });

    currentButtons.push(btnEasy, btnMedium, btnHard);
}

function drawVictoryScreen() {
    clearCanvas();

    // Título animado
    ctx.font = 'bold 60px "Titillium Web", sans-serif';
    ctx.textAlign = 'center';

    const titleGradient = ctx.createLinearGradient(0, 120, 0, 180);
    titleGradient.addColorStop(0, '#03ad56');
    titleGradient.addColorStop(0.5, '#74e0a9');
    titleGradient.addColorStop(1, '#03ad56');
    ctx.fillStyle = titleGradient;

    ctx.shadowColor = '#03ad56';
    ctx.shadowBlur = 30;
    ctx.fillText('¡Felicitaciones!', CANVAS_WIDTH / 2, 150);
    ctx.shadowBlur = 0;

    // Tiempo final
    const seconds = Math.floor(elapsedTime / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const timeString = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;

    ctx.font = '28px "Titillium Web", sans-serif';
    ctx.fillStyle = '#e2e0e0';
    ctx.fillText(`Completaste el rompecabezas en ${timeString}`, CANVAS_WIDTH / 2, 230);

    // Botones
    const btnPlayAgain = new Button(
        CANVAS_WIDTH / 2 - 250,
        300,
        220,
        60,
        'Jugar de Nuevo',
        () => startSlotAnimation(),
        '#03ad56',
        '#74e0a9'
    );

    const btnMenu = new Button(
        CANVAS_WIDTH / 2 + 30,
        300,
        220,
        60,
        'Menú Principal',
        () => showScreen('START'),
        '#5603ad',
        '#8a38f5'
    );

    currentButtons.push(btnPlayAgain, btnMenu);
    currentButtons.forEach(btn => btn.draw(ctx));
}

function drawDefeatScreen() {
    clearCanvas();

    // Título de derrota
    ctx.font = 'bold 60px "Titillium Web", sans-serif';
    ctx.textAlign = 'center';

    const titleGradient = ctx.createLinearGradient(0, 120, 0, 180);
    titleGradient.addColorStop(0, '#f25022');
    titleGradient.addColorStop(0.5, '#ff6b3d');
    titleGradient.addColorStop(1, '#f25022');
    ctx.fillStyle = titleGradient;

    ctx.shadowColor = '#f25022';
    ctx.shadowBlur = 30;
    ctx.fillText('¡Tiempo Agotado!', CANVAS_WIDTH / 2, 150);
    ctx.shadowBlur = 0;

    // Mensaje
    ctx.font = '28px "Titillium Web", sans-serif';
    ctx.fillStyle = '#e2e0e0';
    ctx.fillText('No completaste el rompecabezas a tiempo', CANVAS_WIDTH / 2, 230);

    // Dificultad
    ctx.font = '22px "Titillium Web", sans-serif';
    ctx.fillStyle = '#74e0a9';
    const difficultyText = selectedDifficulty === 6 ? 'Medio (6 piezas)' : 'Difícil (8 piezas)';
    const timeLimit = selectedDifficulty === 6 ? '2:00' : '3:00';
    ctx.fillText(`Dificultad: ${difficultyText} - Tiempo límite: ${timeLimit}`, CANVAS_WIDTH / 2, 270);

    // Botones
    const btnRetry = new Button(
        CANVAS_WIDTH / 2 - 250,
        320,
        220,
        60,
        'Reintentar',
        () => startPuzzle(selectedDifficulty),
        '#f25022',
        '#ff6b3d'
    );

    const btnNewGame = new Button(
        CANVAS_WIDTH / 2 + 30,
        320,
        220,
        60,
        'Nuevo Juego',
        () => startSlotAnimation(),
        '#03ad56',
        '#74e0a9'
    );

    const btnMenu = new Button(
        CANVAS_WIDTH / 2 - 110,
        400,
        220,
        60,
        'Menú Principal',
        () => showScreen('START'),
        '#5603ad',
        '#8a38f5'
    );

    currentButtons.push(btnRetry, btnNewGame, btnMenu);
    currentButtons.forEach(btn => btn.draw(ctx));
}

function drawPuzzleHUD() {
    // Temporizador en la esquina superior izquierda
    let displayTime;
    let timerColor = '#03ad56';

    if (maxTime > 0) {
        // Modo cuenta regresiva
        const remainingTime = Math.max(0, maxTime - elapsedTime);
        const seconds = Math.floor(remainingTime / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        displayTime = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;

        // Cambiar color si quedan menos de 30 segundos
        if (remainingTime <= 30000 && remainingTime > 10000) {
            timerColor = '#f7b731'; // Amarillo
        } else if (remainingTime <= 10000) {
            timerColor = '#f25022'; // Rojo
        }
    } else {
        // Modo sin límite
        const seconds = Math.floor(elapsedTime / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        displayTime = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }

    ctx.font = 'bold 28px "Titillium Web", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = timerColor;
    ctx.fillText(`⏱ ${displayTime}`, 30, 40);

    // Contador de ayudas disponibles
    ctx.font = 'bold 20px "Titillium Web", sans-serif';
    ctx.fillStyle = '#74e0a9';
    ctx.fillText(`💡 Ayudas: ${maxHelps - helpUsed}/${maxHelps}`, 30, 75);

    // Mostrar penalización si se usaron ayudas
    if (timePenalty > 0) {
        const penaltySeconds = timePenalty / 1000;
        ctx.font = 'bold 16px "Titillium Web", sans-serif';
        ctx.fillStyle = '#f25022';
        ctx.fillText(`⚠ Penalización: +${penaltySeconds}s`, 30, 100);
    }

    // Botón de ayuda
    const btnHelp = new Button(
        30,
        CANVAS_HEIGHT - 70,
        160,
        50,
        '💡 Ayuda',
        () => useHelp(),
        helpUsed >= maxHelps ? '#555555' : '#f7b731',
        helpUsed >= maxHelps ? '#666666' : '#ffd32a'
    );

    // Botón de reiniciar en la esquina superior derecha
    const btnRestart = new Button(
        CANVAS_WIDTH - 180,
        10,
        150,
        50,
        'Reiniciar',
        () => startPuzzle(selectedDifficulty),
        '#f25022',
        '#ff6b3d'
    );

    currentButtons = [btnRestart, btnHelp];
    btnRestart.draw(ctx);
    btnHelp.draw(ctx);
}

// ========================================================================================
// SLOT MACHINE
// ========================================================================================

function startSlotAnimation() {
    showScreen('SLOT');

    // Resetear variables
    leverPulled = false;
    leverAnimationProgress = 0;
    slotMessage = '';
    showWinMessage = false;
    flashOverlayActive = false;
    winGlowActive = false;
    reelsShaking = false;
    isSlotSpinning = false;

    // Seleccionar campeón ganador
    winningSymbol = championImages[Math.floor(Math.random() * championImages.length)];
    currentChampionImage = new Image();
    currentChampionImage.src = winningSymbol;

    // Esperar a que la imagen cargue
    currentChampionImage.onload = () => {
        initializeSlotReels();
        drawSlotMachineScreen();
    };
}

function initializeSlotReels() {
    slotReels = [];
    const reelWidth = 130;
    const reelHeight = 180;
    const gap = 20;
    const totalWidth = (reelWidth * SLOT_COLUMNS) + (gap * (SLOT_COLUMNS - 1));
    const startX = (CANVAS_WIDTH - totalWidth) / 2;
    const startY = (CANVAS_HEIGHT - reelHeight) / 2;

    // Crear array de 6 campeones distintos para mostrar inicialmente
    const shuffledIndices = shuffleArray([...Array(championImages.length).keys()]);
    const initialIndices = shuffledIndices.slice(0, SLOT_COLUMNS);

    for (let i = 0; i < SLOT_COLUMNS; i++) {
        const shuffledImages = shuffleArray([...Array(championImages.length).keys()]);

        slotReels.push({
            x: startX + (i * (reelWidth + gap)),
            y: startY,
            width: reelWidth,
            height: reelHeight,
            images: shuffledImages.slice(0, 3).map(idx => championImagesLoaded[idx]),
            initialChampionImg: championImagesLoaded[initialIndices[i]], // Usar imagen precargada
            initialChampion: championImages[initialIndices[i]],
            currentImageIndex: 0,
            spinning: false,
            offset: 0,
            speed: 20,
            stopped: false
        });
    }
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function spinSlotReels() {
    // Prevenir múltiples partidas simultáneas
    if (isSlotSpinning || leverPulled) return;

    isSlotSpinning = true;
    slotMessage = '';
    showWinMessage = false;
    winGlowActive = false;
    flashOverlayActive = false;

    // Animar la palanca primero
    animateLever();

    // Reproducir sonido del slot machine sincronizado con la bajada de la palanca
    setTimeout(() => {
        if (jackpotAudio) {
            jackpotAudio.currentTime = 0;
            jackpotAudio.playbackRate = 1.0;
            jackpotAudio.play().catch(e => console.error("Error al reproducir el audio:", e));
        }
    }, 0); // Pequeño delay para que suene cuando la palanca empieza a bajar

    // Iniciar spinning en todos los reels después de que la palanca baje
    setTimeout(() => {
        slotReels.forEach(reel => {
            reel.spinning = true;
            reel.stopped = false;
        });

        // Detener cada reel con delay
        slotReels.forEach((reel, index) => {
            const stopTime = SLOT_SPIN_DURATION + (index * SLOT_COLUMN_DELAY);

            setTimeout(() => {
                reel.spinning = false;
                reel.stopped = true;
                reel.offset = 0;

                // Si es el último reel, mostrar victoria
                if (index === slotReels.length - 1) {
                    setTimeout(() => {
                        showSlotWin();
                    }, 100);
                }
            }, stopTime);
        });
    }, 200); // Esperar a que la palanca baje completamente

    // Iniciar animación
    animateSlot();
}

function animateLever() {
    leverPulled = true;
    leverAnimationProgress = 0;

    const pullDuration = 200; // Tiempo de bajada (rápido)
    const returnDuration = 400; // Tiempo de subida (más lento con bounce)
    const totalDuration = pullDuration + returnDuration;
    const startTime = Date.now();

    function updateLever() {
        const elapsed = Date.now() - startTime;
        const totalProgress = elapsed / totalDuration;

        if (totalProgress < pullDuration / totalDuration) {
            // Fase de bajada (0 a 0.33) - Easing out (rápido al inicio, desacelera al final)
            const pullProgress = elapsed / pullDuration;
            leverAnimationProgress = easeOutCubic(pullProgress);
        } else {
            // Fase de subida (0.33 a 1) - Easing con bounce
            const returnProgress = (elapsed - pullDuration) / returnDuration;
            leverAnimationProgress = 1 - easeOutBounce(returnProgress);
        }

        if (totalProgress < 1) {
            requestAnimationFrame(updateLever);
        } else {
            leverPulled = false;
            leverAnimationProgress = 0;
        }
    }

    updateLever();
}

// Función de easing para bajada suave
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// Función de easing con efecto bounce para subida
function easeOutBounce(t) {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (t < 1 / d1) {
        return n1 * t * t;
    } else if (t < 2 / d1) {
        return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
        return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
}

function animateSlot() {
    if (!isSlotSpinning && slotReels.every(r => r.stopped)) {
        return;
    }

    drawSlotMachineScreen();
    slotAnimationFrame = requestAnimationFrame(animateSlot);
}

function drawSlotMachineScreen() {
    clearCanvas();

    // Título
    ctx.font = 'bold 48px "Titillium Web", sans-serif';
    ctx.textAlign = 'center';

    const titleGradient = ctx.createLinearGradient(0, 30, 0, 80);
    titleGradient.addColorStop(0, '#03ad56');
    titleGradient.addColorStop(1, '#74e0a9');
    ctx.fillStyle = titleGradient;

    // Efecto de brillo en el título
    ctx.shadowColor = 'rgba(3, 173, 86, 0.6)';
    ctx.shadowBlur = winGlowActive ? 30 : 10;
    ctx.fillText('★ SLOT MACHINE ★', CANVAS_WIDTH / 2, 60);
    ctx.shadowBlur = 0;

    // Flash overlay
    if (flashOverlayActive) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // Win glow
    if (winGlowActive) {
        const glowGradient = ctx.createRadialGradient(
            CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 0,
            CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH / 2
        );
        glowGradient.addColorStop(0, 'rgba(3, 173, 86, 0.2)');
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // Contenedor de reels con shake
    ctx.save();
    if (reelsShaking) {
        const shakeX = (Math.random() - 0.5) * 10;
        ctx.translate(shakeX, 0);
    }

    drawReelsContainer();
    drawSlotReels();

    ctx.restore();

    // Palanca
    drawLever();

    // Mensaje
    if (showWinMessage) {
        ctx.font = 'bold 42px "Titillium Web", sans-serif';
        ctx.textAlign = 'center';

        const messageGradient = ctx.createLinearGradient(0, 440, 0, 480);
        messageGradient.addColorStop(0, '#03ad56');
        messageGradient.addColorStop(0.5, '#74e0a9');
        messageGradient.addColorStop(1, '#03ad56');
        ctx.fillStyle = messageGradient;

        const time = Date.now() / 600;
        const scale = 1 + Math.sin(time) * 0.1;
        ctx.save();
        ctx.translate(CANVAS_WIDTH / 2, 460);
        ctx.scale(scale, scale);
        ctx.shadowColor = '#03ad56';
        ctx.shadowBlur = 20;
        ctx.fillText(slotMessage, 0, 0);
        ctx.restore();
    }
}

function drawReelsContainer() {
    const reelWidth = 130;
    const reelHeight = 180;
    const gap = 20;
    const totalWidth = (reelWidth * SLOT_COLUMNS) + (gap * (SLOT_COLUMNS - 1));
    const padding = 40;

    const containerX = (CANVAS_WIDTH - totalWidth) / 2 - padding;
    const containerY = slotReels[0].y - padding;
    const containerWidth = totalWidth + (padding * 2);
    const containerHeight = reelHeight + (padding * 2);

    // Fondo del contenedor
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.roundRect(containerX, containerY, containerWidth, containerHeight, 20);
    ctx.fill();

    // Borde del contenedor
    ctx.strokeStyle = 'rgba(3, 173, 86, 0.4)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Gradientes de sombra arriba y abajo
    const topGradient = ctx.createLinearGradient(0, containerY + padding, 0, containerY + padding + 40);
    topGradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
    topGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = topGradient;
    ctx.fillRect(containerX, containerY + padding, containerWidth, 40);

    const bottomGradient = ctx.createLinearGradient(0, containerY + containerHeight - padding - 40, 0, containerY + containerHeight - padding);
    bottomGradient.addColorStop(0, 'transparent');
    bottomGradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
    ctx.fillStyle = bottomGradient;
    ctx.fillRect(containerX, containerY + containerHeight - padding - 40, containerWidth, 40);
}

function drawSlotReels() {
    slotReels.forEach((reel) => {
        // Fondo del reel
        const bgGradient = ctx.createLinearGradient(0, reel.y, 0, reel.y + reel.height);
        bgGradient.addColorStop(0, '#1a0033');
        bgGradient.addColorStop(0.5, '#2d0052');
        bgGradient.addColorStop(1, '#1a0033');
        ctx.fillStyle = bgGradient;
        ctx.beginPath();
        ctx.roundRect(reel.x, reel.y, reel.width, reel.height, 15);
        ctx.fill();

        // Clip para el contenido del reel
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(reel.x, reel.y, reel.width, reel.height, 15);
        ctx.clip();

        if (reel.spinning) {
            // Animar offset
            reel.offset += reel.speed;
            if (reel.offset >= 180) { // altura aproximada de un símbolo
                reel.offset = 0;
                // Cambiar imagen usando las precargadas
                const randomIdx = Math.floor(Math.random() * championImagesLoaded.length);
                reel.images[reel.currentImageIndex] = championImagesLoaded[randomIdx];
                reel.currentImageIndex = (reel.currentImageIndex + 1) % reel.images.length;
            }

            // Dibujar símbolos con blur
            ctx.filter = 'blur(3px) brightness(0.7)';

            // Dibujar múltiples símbolos para crear efecto continuo
            for (let i = -1; i <= 1; i++) {
                const img = reel.images[(reel.currentImageIndex + i + reel.images.length) % reel.images.length];
                const symbolY = reel.y + (i * 180) + reel.offset;
                drawImageCover(ctx, img, reel.x + 10, symbolY + 35, 110, 110);
            }

            ctx.filter = 'none';
        } else if (reel.stopped) {
            // Mostrar imagen ganadora
            const centerY = reel.y + (reel.height / 2) - 55;
            drawImageCover(ctx, currentChampionImage, reel.x + 10, centerY, 110, 110);
        } else {
            // Mostrar campeón inicial único para este reel (precargado)
            const centerY = reel.y + (reel.height / 2) - 55;
            drawImageCover(ctx, reel.initialChampionImg, reel.x + 10, centerY, 110, 110);
        }

        ctx.restore();

        // Borde del reel
        const borderGradient = ctx.createLinearGradient(0, reel.y, 0, reel.y + reel.height);
        borderGradient.addColorStop(0, '#03ad56');
        borderGradient.addColorStop(0.5, '#74e0a9');
        borderGradient.addColorStop(1, '#03ad56');
        ctx.strokeStyle = borderGradient;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(reel.x, reel.y, reel.width, reel.height, 15);
        ctx.stroke();

        // Efecto de brillo en el borde
        ctx.save();
        ctx.globalAlpha = 0.1;
        const glowGradient = ctx.createLinearGradient(0, reel.y, 0, reel.y + reel.height);
        glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        glowGradient.addColorStop(0.2, 'transparent');
        glowGradient.addColorStop(0.8, 'transparent');
        glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(reel.x, reel.y, reel.width, reel.height);
        ctx.restore();
    });
}

function drawLever() {
    const leverX = CANVAS_WIDTH - 150;
    const leverY = CANVAS_HEIGHT / 2 + 60; // Bajado 60px para que se vea más anclada

    // Base de la palanca
    const baseGradient = ctx.createLinearGradient(leverX - 25, 0, leverX + 25, 0);
    baseGradient.addColorStop(0, '#1a1a1a');
    baseGradient.addColorStop(0.1, '#2d2d2d');
    baseGradient.addColorStop(0.5, '#404040');
    baseGradient.addColorStop(0.9, '#2d2d2d');
    baseGradient.addColorStop(1, '#1a1a1a');

    ctx.fillStyle = baseGradient;
    ctx.beginPath();
    ctx.roundRect(leverX - 25, leverY - 60, 50, 120, 10);
    ctx.fill();

    // Sombra de la base
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetY = 5;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Soporte inferior
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.ellipse(leverX, leverY + 60, 30, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Brazo de la palanca
    const armHeight = 160;
    const maxPullDistance = armHeight * 0.8; // Distancia máxima de bajada
    const pullOffset = leverPulled ? leverAnimationProgress * maxPullDistance : 0;

    const armGradient = ctx.createLinearGradient(leverX - 7, 0, leverX + 7, 0);
    armGradient.addColorStop(0, '#999');
    armGradient.addColorStop(0.2, '#ccc');
    armGradient.addColorStop(0.4, '#fff');
    armGradient.addColorStop(0.6, '#ccc');
    armGradient.addColorStop(0.8, '#999');
    armGradient.addColorStop(1, '#666');

    ctx.fillStyle = armGradient;
    ctx.beginPath();
    const armTop = leverY - 40 - armHeight;
    const armVisibleHeight = armHeight - pullOffset; // El brazo se "encoge" visualmente
    ctx.roundRect(leverX - 7, armTop + pullOffset, 14, armVisibleHeight, 7);
    ctx.fill();

    // Bola roja de la palanca - baja junto con el brazo
    const ballY = armTop + pullOffset;

    const ballGradient = ctx.createRadialGradient(
        leverX - 10, ballY - 10, 5,
        leverX, ballY, 32
    );
    ballGradient.addColorStop(0, '#ff6666');
    ballGradient.addColorStop(0.3, '#ff0000');
    ballGradient.addColorStop(0.6, '#cc0000');
    ballGradient.addColorStop(1, '#990000');

    ctx.fillStyle = ballGradient;
    ctx.beginPath();
    ctx.arc(leverX, ballY, 32, 0, Math.PI * 2);
    ctx.fill();

    // Brillo en la bola
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(leverX - 8, ballY - 8, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(leverX - 5, ballY - 5, 8, 0, Math.PI * 2);
    ctx.fill();

    // Sombra de la bola
    ctx.shadowColor = 'rgba(255, 0, 0, 0.6)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(leverX, ballY, 32, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
}

function showSlotWin() {
    isSlotSpinning = false;
    slotMessage = '🎉 ¡GANASTE! 🎉';
    showWinMessage = true;
    winGlowActive = true;

    // Flash overlay
    flashOverlayActive = true;
    setTimeout(() => {
        flashOverlayActive = false;
    }, 500);

    // Shake de los reels
    reelsShaking = true;
    setTimeout(() => {
        reelsShaking = false;
    }, 500);

    // Continuar a la selección de dificultad
    setTimeout(() => {
        if (slotAnimationFrame) {
            cancelAnimationFrame(slotAnimationFrame);
        }
        showScreen('DIFFICULTY');
    }, 3000);
}

// Función auxiliar para dibujar imagen con object-fit: cover
function drawImageCover(ctx, img, x, y, width, height) {
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const imgRatio = img.naturalWidth / img.naturalHeight;
    const boxRatio = width / height;

    let drawWidth, drawHeight, offsetX = 0, offsetY = 0;

    if (imgRatio > boxRatio) {
        // Imagen más ancha: ajustar altura
        drawHeight = height;
        drawWidth = height * imgRatio;
        offsetX = (width - drawWidth) / 2;
    } else {
        // Imagen más alta: ajustar ancho
        drawWidth = width;
        drawHeight = width / imgRatio;
        offsetY = (height - drawHeight) / 2;
    }

    ctx.save();
    // Crear clipping para que no se salga del área
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();

    ctx.drawImage(img, x + offsetX, y + offsetY, drawWidth, drawHeight);
    ctx.restore();
}

// ========================================================================================
// ROMPECABEZAS
// ========================================================================================

function startPuzzle(numPieces) {
    selectedDifficulty = numPieces;
    showScreen('PUZZLE');
    puzzleCompleted = false;
    helpUsed = 0; // Resetear contador de ayudas
    timePenalty = 0; // Resetear penalización de tiempo

    // Establecer tiempo máximo según dificultad
    if (numPieces === 4) {
        maxTime = 0; // Sin límite para 4 piezas
    } else if (numPieces === 6) {
        maxTime = 20000; // 20 Segundos para 6 piezas
    } else { // 8 piezas
        maxTime = 30000; // 30 segundos para 8 piezas
    }

    // Calcular grid del rompecabezas con piezas cuadradas
    let cols, rows;
    if (numPieces === 4) {
        cols = 2;
        rows = 2;
    } else if (numPieces === 6) {
        cols = 3;
        rows = 2;
    } else { // 8 piezas
        cols = 4;
        rows = 2;
    }

    // Calcular el tamaño de las piezas para que todas las dificultades sean del mismo tamaño
    // Usar siempre el tamaño de 4 piezas como referencia (GAME_AREA_HEIGHT / 2)
    const pieceSize = GAME_AREA_HEIGHT / 2; // Todas las piezas del mismo tamaño

    // Calcular el área total del puzzle con piezas cuadradas
    const puzzleWidth = pieceSize * cols;
    const puzzleHeight = pieceSize * rows;

    // Centrar el puzzle en el área de juego
    const puzzleStartX = GAME_AREA_X + (GAME_AREA_WIDTH - puzzleWidth) / 2;
    const puzzleStartY = GAME_AREA_Y + (GAME_AREA_HEIGHT - puzzleHeight) / 2;

    // Calcular dimensiones de la imagen original respetando aspect ratio
    const imgRatio = currentChampionImage.naturalWidth / currentChampionImage.naturalHeight;
    const puzzleRatio = puzzleWidth / puzzleHeight;

    let sourceWidth, sourceHeight, sourceX, sourceY;

    // Ajustar para usar toda la imagen (contain)
    if (imgRatio > puzzleRatio) {
        // Imagen más ancha: usar toda la altura
        sourceHeight = currentChampionImage.naturalHeight;
        sourceWidth = sourceHeight * puzzleRatio;
        sourceX = (currentChampionImage.naturalWidth - sourceWidth) / 2;
        sourceY = 0;
    } else {
        // Imagen más alta: usar todo el ancho
        sourceWidth = currentChampionImage.naturalWidth;
        sourceHeight = sourceWidth / puzzleRatio;
        sourceX = 0;
        sourceY = (currentChampionImage.naturalHeight - sourceHeight) / 2;
    }

    // Crear piezas cuadradas
    puzzlePieces = [];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            puzzlePieces.push({
                x: puzzleStartX + (col * pieceSize),
                y: puzzleStartY + (row * pieceSize),
                width: pieceSize,
                height: pieceSize,
                sourceX: sourceX + (col * sourceWidth / cols),
                sourceY: sourceY + (row * sourceHeight / rows),
                sourceWidth: sourceWidth / cols,
                sourceHeight: sourceHeight / rows,
                rotation: Math.floor(Math.random() * 4) * 90, // 0, 90, 180, 270
                correctRotation: 0,
                isFixed: false // Indica si la pieza está fija (ayuda usada)
            });
        }
    }

    // Iniciar temporizador
    startTimer();

    // Dibujar rompecabezas
    drawPuzzle();
}

function drawPuzzle() {
    // Limpiar y redibujar fondo
    clearCanvas();

    // Calcular dimensiones del puzzle para el borde
    let cols, rows;
    if (selectedDifficulty === 4) {
        cols = 2;
        rows = 2;
    } else if (selectedDifficulty === 6) {
        cols = 3;
        rows = 2;
    } else {
        cols = 4;
        rows = 2;
    }

    const pieceSize = GAME_AREA_HEIGHT / 2;
    const puzzleWidth = pieceSize * cols;
    const puzzleHeight = pieceSize * rows;
    const puzzleStartX = GAME_AREA_X + (GAME_AREA_WIDTH - puzzleWidth) / 2;
    const puzzleStartY = GAME_AREA_Y + (GAME_AREA_HEIGHT - puzzleHeight) / 2;

    // Marco decorativo ajustado al tamaño del puzzle
    ctx.strokeStyle = '#5603ad';
    ctx.lineWidth = 3;
    ctx.strokeRect(puzzleStartX - 5, puzzleStartY - 5, puzzleWidth + 10, puzzleHeight + 10);

    puzzlePieces.forEach(piece => {
        ctx.save();

        // Crear clipping para evitar que las piezas se superpongan al rotar
        ctx.beginPath();
        ctx.rect(piece.x, piece.y, piece.width, piece.height);
        ctx.clip();

        // Aplicar filtro de grises si la pieza NO está correctamente rotada
        const isCorrect = piece.rotation === piece.correctRotation;
        if (!isCorrect) {
            ctx.filter = 'grayscale(100%)';
        }

        // Trasladar al centro de la pieza
        ctx.translate(piece.x + piece.width / 2, piece.y + piece.height / 2);

        // Rotar
        ctx.rotate((piece.rotation * Math.PI) / 180);

        // Dibujar la pieza desde el centro usando las dimensiones correctas de la fuente
        ctx.drawImage(
            currentChampionImage,
            piece.sourceX,
            piece.sourceY,
            piece.sourceWidth,
            piece.sourceHeight,
            -piece.width / 2,
            -piece.height / 2,
            piece.width,
            piece.height
        );

        ctx.restore();

        // Borde de la pieza (verde si correcta o fija, morado si incorrecta, dorado si es ayuda)
        if (piece.isFixed) {
            ctx.strokeStyle = '#f7b731'; // Dorado para piezas fijas (ayuda)
            ctx.lineWidth = 5;
            ctx.shadowColor = '#f7b731';
            ctx.shadowBlur = 10;
        } else {
            ctx.strokeStyle = isCorrect ? '#03ad56' : '#5603ad';
            ctx.lineWidth = 3;
            ctx.shadowBlur = 0;
        }
        ctx.strokeRect(piece.x, piece.y, piece.width, piece.height);
        ctx.shadowBlur = 0; // Resetear sombra
    });
}

// ========================================================================================
// SISTEMA DE AYUDA
// ========================================================================================

function useHelp() {
    // Verificar si aún quedan ayudas disponibles y si el puzzle no está completado
    if (helpUsed >= maxHelps || puzzleCompleted) return;

    // Encontrar piezas que no estén correctas y no estén fijas
    const incorrectPieces = puzzlePieces.filter(piece =>
        piece.rotation !== piece.correctRotation && !piece.isFixed
    );

    // Si no hay piezas incorrectas, no hacer nada
    if (incorrectPieces.length === 0) return;

    // Seleccionar una pieza aleatoria de las incorrectas
    const randomIndex = Math.floor(Math.random() * incorrectPieces.length);
    const selectedPiece = incorrectPieces[randomIndex];

    // Colocar la pieza en su rotación correcta
    selectedPiece.rotation = selectedPiece.correctRotation;
    selectedPiece.isFixed = true; // Marcar como fija

    // Incrementar contador de ayudas usadas
    helpUsed++;

    // Agregar penalización de 5 segundos (5000 ms)
    timePenalty += 5000;

    // Redibujar el puzzle
    drawPuzzle();
    drawPuzzleHUD();

    // Verificar si se completó el puzzle
    checkPuzzleComplete();
}

// ========================================================================================
// INTERACCIÓN CON EL CANVAS
// ========================================================================================

function handleCanvasMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let needsRedraw = false;
    hoveredButton = null;
    let overLever = false;

    // Verificar si el mouse está sobre la palanca (en el estado de slot)
    if (currentGameState === 'SLOT' && !isSlotSpinning) {
        const leverX = CANVAS_WIDTH - 150;
        const leverY = CANVAS_HEIGHT / 2 + 60; // Misma posición que en drawLever
        const armHeight = 160;
        const ballY = leverY - 60 - armHeight;
        const ballRadius = 32;

        const distance = Math.sqrt(Math.pow(x - leverX, 2) + Math.pow(y - ballY, 2));
        if (distance <= ballRadius) {
            overLever = true;
            canvas.style.cursor = 'pointer';
        }
    }

    // Verificar si el mouse está sobre algún botón
    for (const button of currentButtons) {
        const wasHovered = button.isHovered;
        button.isHovered = button.isPointInside(x, y);

        if (button.isHovered) {
            hoveredButton = button;
            canvas.style.cursor = 'pointer';
        }

        if (wasHovered !== button.isHovered) {
            needsRedraw = true;
        }
    }

    if (!hoveredButton && !overLever) {
        canvas.style.cursor = 'default';
    }

    // Redibujar si cambió el estado de hover
    if (needsRedraw && currentGameState !== 'PUZZLE' && currentGameState !== 'SLOT') {
        showScreen(currentGameState);
    }
}

function handleCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Verificar si se clickeó un botón
    for (const button of currentButtons) {
        if (button.isPointInside(x, y)) {
            button.handleClick();
            return;
        }
    }

    // Si estamos en el slot, verificar si se clickeó la palanca
    if (currentGameState === 'SLOT' && !isSlotSpinning) {
        const leverX = CANVAS_WIDTH - 150;
        const leverY = CANVAS_HEIGHT / 2 + 60; // Misma posición que en drawLever
        const armHeight = 160;
        const ballY = leverY - 60 - armHeight;
        const ballRadius = 32;

        // Verificar si el click está en la bola de la palanca
        const distance = Math.sqrt(Math.pow(x - leverX, 2) + Math.pow(y - ballY, 2));
        if (distance <= ballRadius) {
            spinSlotReels();
            return;
        }
    }

    // Si estamos en el puzzle y no se clickeó un botón, rotar pieza
    if (currentGameState === 'PUZZLE' && !puzzleCompleted) {
        const clickedPiece = getPieceAtPosition(x, y);
        if (clickedPiece && !clickedPiece.isFixed) {
            // Rotar a la izquierda (sentido antihorario)
            clickedPiece.rotation = (clickedPiece.rotation - 90 + 360) % 360;
            drawPuzzle();
            drawPuzzleHUD();
            checkPuzzleComplete();
        }
    }
}

function handleCanvasRightClick(e) {
    e.preventDefault();
    if (currentGameState !== 'PUZZLE' || puzzleCompleted) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedPiece = getPieceAtPosition(x, y);
    if (clickedPiece && !clickedPiece.isFixed) {
        // Rotar a la derecha (sentido horario)
        clickedPiece.rotation = (clickedPiece.rotation + 90) % 360;
        drawPuzzle();
        drawPuzzleHUD();
        checkPuzzleComplete();
    }
}

function getPieceAtPosition(x, y) {
    return puzzlePieces.find(piece =>
        x >= piece.x &&
        x <= piece.x + piece.width &&
        y >= piece.y &&
        y <= piece.y + piece.height
    );
}

function checkPuzzleComplete() {
    const allCorrect = puzzlePieces.every(piece => piece.rotation === piece.correctRotation);

    if (allCorrect && !puzzleCompleted) {
        puzzleCompleted = true;
        stopTimer();
        // Redibujar sin filtro de grises para mostrar la imagen completa
        drawPuzzleComplete();

        setTimeout(() => {
            showVictory();
        }, 1500);
    }
}

function drawPuzzleComplete() {
    clearCanvas();

    // Calcular dimensiones del puzzle completado (mismo cálculo que en startPuzzle)
    let cols, rows;
    if (selectedDifficulty === 4) {
        cols = 2;
        rows = 2;
    } else if (selectedDifficulty === 6) {
        cols = 3;
        rows = 2;
    } else {
        cols = 4;
        rows = 2;
    }

    const pieceSize = GAME_AREA_HEIGHT / 2;
    const puzzleWidth = pieceSize * cols;
    const puzzleHeight = pieceSize * rows;
    const puzzleStartX = GAME_AREA_X + (GAME_AREA_WIDTH - puzzleWidth) / 2;
    const puzzleStartY = GAME_AREA_Y + (GAME_AREA_HEIGHT - puzzleHeight) / 2;

    // Marco decorativo del área de puzzle
    ctx.strokeStyle = '#03ad56';
    ctx.lineWidth = 5;
    ctx.strokeRect(puzzleStartX - 5, puzzleStartY - 5, puzzleWidth + 10, puzzleHeight + 10);

    // Dibujar la imagen completa sin filtros ni rotaciones
    const imgRatio = currentChampionImage.naturalWidth / currentChampionImage.naturalHeight;
    const puzzleRatio = puzzleWidth / puzzleHeight;

    let sourceWidth, sourceHeight, sourceX, sourceY;

    if (imgRatio > puzzleRatio) {
        sourceHeight = currentChampionImage.naturalHeight;
        sourceWidth = sourceHeight * puzzleRatio;
        sourceX = (currentChampionImage.naturalWidth - sourceWidth) / 2;
        sourceY = 0;
    } else {
        sourceWidth = currentChampionImage.naturalWidth;
        sourceHeight = sourceWidth / puzzleRatio;
        sourceX = 0;
        sourceY = (currentChampionImage.naturalHeight - sourceHeight) / 2;
    }

    ctx.drawImage(
        currentChampionImage,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        puzzleStartX,
        puzzleStartY,
        puzzleWidth,
        puzzleHeight
    );

    // Efecto de brillo de victoria
    ctx.save();
    ctx.strokeStyle = '#03ad56';
    ctx.lineWidth = 8;
    ctx.shadowColor = '#03ad56';
    ctx.shadowBlur = 20;
    ctx.strokeRect(puzzleStartX, puzzleStartY, puzzleWidth, puzzleHeight);
    ctx.restore();
}

// ========================================================================================
// TEMPORIZADOR
// ========================================================================================

function startTimer() {
    startTime = Date.now();
    elapsedTime = 0;

    timerInterval = setInterval(() => {
        elapsedTime = Date.now() - startTime + timePenalty;
        updateTimerDisplay();
    }, 100);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateTimerDisplay() {
    // Verificar si se acabó el tiempo (solo para 6 y 8 piezas)
    if (maxTime > 0 && elapsedTime >= maxTime && !puzzleCompleted) {
        stopTimer();
        showDefeat();
        return;
    }

    // Redibujar el puzzle y el HUD con el tiempo actualizado
    if (currentGameState === 'PUZZLE') {
        drawPuzzle();
        drawPuzzleHUD();
    }
}

function showVictory() {
    showScreen('VICTORY');
}

function showDefeat() {
    puzzleCompleted = true; // Marcar como terminado para evitar interacciones
    showScreen('DEFEAT');
}

// ========================================================================================
// INICIO DE LA APLICACIÓN
// ========================================================================================

window.addEventListener('DOMContentLoaded', init);
