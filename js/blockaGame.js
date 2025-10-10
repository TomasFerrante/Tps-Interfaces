// ========================================================================================
// BLOCKA GAME - League of Legends Puzzle Game
// Sistema completo: Slot Machine + Rompecabezas con rotación
// ========================================================================================

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

// Área de juego (cuadrada y centrada)
const GAME_SIZE = 400; // Tamaño cuadrado para el área de juego
const GAME_AREA_X = (CANVAS_WIDTH - GAME_SIZE) / 2;
const GAME_AREA_Y = (CANVAS_HEIGHT - GAME_SIZE) / 2;
const GAME_AREA_WIDTH = GAME_SIZE;
const GAME_AREA_HEIGHT = GAME_SIZE;

const SLOT_COLUMNS = 6;
const SLOT_SPIN_DURATION = 2000; // ms
const SLOT_COLUMN_DELAY = 300; // ms entre columnas

// ========================================================================================
// VARIABLES GLOBALES
// ========================================================================================

let canvas, ctx;
let currentGameState = 'START'; // START, SLOT, DIFFICULTY, PUZZLE, VICTORY
let currentChampionImage = null;
let selectedDifficulty = 4;
let puzzlePieces = [];
let timerInterval = null;
let startTime = 0;
let elapsedTime = 0;

// Slot machine
let slotReels = [];
let isSlotSpinning = false;

// ========================================================================================
// ELEMENTOS DOM
// ========================================================================================

const startScreen = document.getElementById('start-screen');
const instructionsScreen = document.getElementById('instructions-screen');
const difficultyScreen = document.getElementById('difficulty-screen');
const gameHud = document.getElementById('game-hud');
const victoryScreen = document.getElementById('victory-screen');
const timerDisplay = document.getElementById('timer-display');
const finalTimeDisplay = document.getElementById('final-time');
const menuGame = document.getElementById('menu-game');

// Botones
const btnInstructions = document.getElementById('btn-instructions');
const btnPlay = document.getElementById('btn-play');
const btnBack = document.getElementById('btn-back');
const btnEasy = document.getElementById('btn-easy');
const btnMedium = document.getElementById('btn-medium');
const btnHard = document.getElementById('btn-hard');
const btnRestartPuzzle = document.getElementById('btn-restart-puzzle');
const btnPlayAgain = document.getElementById('btn-play-again');
const btnMenu = document.getElementById('btn-menu');

// ========================================================================================
// INICIALIZACIÓN
// ========================================================================================

function init() {
    canvas = document.getElementById('canvas-game');
    ctx = canvas.getContext('2d');

    setupEventListeners();
    showScreen('START');
    drawCanvas();
}

function setupEventListeners() {
    // Navegación
    btnInstructions.addEventListener('click', () => showScreen('INSTRUCTIONS'));
    btnBack.addEventListener('click', () => showScreen('START'));
    btnPlay.addEventListener('click', startSlotAnimation);

    // Dificultad
    btnEasy.addEventListener('click', () => startPuzzle(4));
    btnMedium.addEventListener('click', () => startPuzzle(6));
    btnHard.addEventListener('click', () => startPuzzle(8));

    // Controles del juego
    btnRestartPuzzle.addEventListener('click', () => startPuzzle(selectedDifficulty));
    btnPlayAgain.addEventListener('click', startSlotAnimation);
    btnMenu.addEventListener('click', () => {
        showScreen('START');
        drawCanvas();
    });

    // Clicks del canvas para el rompecabezas
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('contextmenu', handleCanvasRightClick);
}

// ========================================================================================
// GESTIÓN DE PANTALLAS
// ========================================================================================

function showScreen(screen) {
    currentGameState = screen;

    // Ocultar todas las pantallas
    startScreen.classList.add('hidden');
    instructionsScreen.classList.add('hidden');
    difficultyScreen.classList.add('hidden');
    gameHud.classList.add('hidden');
    victoryScreen.classList.add('hidden');

    menuGame.classList.remove('hidden');

    // Limpiar el canvas antes de dibujar
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Mostrar la pantalla correspondiente
    switch(screen) {
        case 'START':
            startScreen.classList.remove('hidden');
            clearCanvas();
            break;
        case 'INSTRUCTIONS':
            instructionsScreen.classList.remove('hidden');
            break;
        case 'SLOT':
            // No hay overlay, solo canvas
            break;
        case 'DIFFICULTY':
            difficultyScreen.classList.remove('hidden');
            break;
        case 'PUZZLE':
            gameHud.classList.remove('hidden');
            break;
        case 'VICTORY':
            victoryScreen.classList.remove('hidden');
            break;
    }
}

// ========================================================================================
// SLOT MACHINE
// ========================================================================================

function startSlotAnimation() {
    showScreen('SLOT');

    // Seleccionar campeón ganador
    currentChampionImage = new Image();
    currentChampionImage.src = championImages[Math.floor(Math.random() * championImages.length)];

    // Esperar a que la imagen cargue
    currentChampionImage.onload = () => {
        initializeSlotReels();
        spinSlotReels();
    };
}

function initializeSlotReels() {
    slotReels = [];
    const reelWidth = GAME_AREA_WIDTH / SLOT_COLUMNS;

    for (let i = 0; i < SLOT_COLUMNS; i++) {
        // Crear un array de imágenes únicas para cada reel (sin repeticiones)
        const shuffledImages = shuffleArray([...championImages]);

        slotReels.push({
            x: GAME_AREA_X + (i * reelWidth),
            y: GAME_AREA_Y,
            width: reelWidth,
            height: GAME_AREA_HEIGHT,
            images: shuffledImages.slice(0, 3).map(src => {
                const img = new Image();
                img.src = src;
                return img;
            }),
            currentImageIndex: 0,
            spinning: false,
            offset: 0,
            speed: 20
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
    isSlotSpinning = true;

    // Iniciar spinning en todos los reels
    slotReels.forEach(reel => {
        reel.spinning = true;
    });

    // Detener cada reel con delay
    slotReels.forEach((reel, index) => {
        setTimeout(() => {
            stopReel(reel, index === slotReels.length - 1);
        }, SLOT_SPIN_DURATION + (index * SLOT_COLUMN_DELAY));
    });

    animateSlot();
}

function stopReel(reel, isLast) {
    reel.spinning = false;
    reel.offset = 0;

    if (isLast) {
        isSlotSpinning = false;
        // Esperar un momento y mostrar pantalla de dificultad
        setTimeout(() => {
            showScreen('DIFFICULTY');
        }, 500);
    }
}

function animateSlot() {
    if (!isSlotSpinning && !slotReels.some(r => r.spinning)) {
        return;
    }

    drawSlotMachine();
    requestAnimationFrame(animateSlot);
}

function drawSlotMachine() {
    // Limitar el área de dibujo al área del juego
    ctx.save();
    ctx.beginPath();
    ctx.rect(GAME_AREA_X, GAME_AREA_Y, GAME_AREA_WIDTH, GAME_AREA_HEIGHT);
    ctx.clip();

    // Marco decorativo del área de juego
    ctx.strokeStyle = '#5603ad';
    ctx.lineWidth = 3;
    ctx.strokeRect(GAME_AREA_X - 5, GAME_AREA_Y - 5, GAME_AREA_WIDTH + 10, GAME_AREA_HEIGHT + 10);

    slotReels.forEach((reel) => {
        if (reel.spinning) {
            // Animar offset
            reel.offset += reel.speed;
            if (reel.offset >= reel.height) {
                reel.offset = 0;
                // Cambiar a imagen aleatoria diferente
                const availableImages = championImages.filter(src =>
                    !reel.images.some(img => img.src.includes(src.split('/').pop()))
                );
                if (availableImages.length > 0) {
                    const randomSrc = availableImages[Math.floor(Math.random() * availableImages.length)];
                    const newImg = new Image();
                    newImg.src = randomSrc;
                    reel.images[reel.currentImageIndex] = newImg;
                }
                reel.currentImageIndex = (reel.currentImageIndex + 1) % reel.images.length;
            }

            // Dibujar con blur (sin estirar - usando object-fit cover)
            ctx.save();
            ctx.filter = 'blur(5px) brightness(0.7)';

            // Primera imagen (arriba)
            drawImageCover(
                ctx,
                reel.images[reel.currentImageIndex],
                reel.x,
                reel.y - reel.height + reel.offset,
                reel.width,
                reel.height
            );

            // Segunda imagen (abajo)
            drawImageCover(
                ctx,
                reel.images[(reel.currentImageIndex + 1) % reel.images.length],
                reel.x,
                reel.y + reel.offset,
                reel.width,
                reel.height
            );

            ctx.restore();
        } else {
            // Dibujar imagen final (campeón ganador) sin estirar
            drawImageCover(
                ctx,
                currentChampionImage,
                reel.x,
                reel.y,
                reel.width,
                reel.height
            );
        }

        // Bordes de la columna
        ctx.strokeStyle = '#03ad56';
        ctx.lineWidth = 3;
        ctx.strokeRect(reel.x, reel.y, reel.width, reel.height);
    });

    ctx.restore(); // Restaurar el contexto para eliminar el clipping
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

    // Calcular grid del rompecabezas
    const cols = numPieces === 4 ? 2 : numPieces === 6 ? 3 : 4;
    const rows = numPieces === 4 ? 2 : numPieces === 6 ? 2 : 2;

    const pieceWidth = GAME_AREA_WIDTH / cols;
    const pieceHeight = GAME_AREA_HEIGHT / rows;

    // Crear piezas
    puzzlePieces = [];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            puzzlePieces.push({
                x: GAME_AREA_X + (col * pieceWidth),
                y: GAME_AREA_Y + (row * pieceHeight),
                width: pieceWidth,
                height: pieceHeight,
                sourceX: col * pieceWidth,
                sourceY: row * pieceHeight,
                rotation: Math.floor(Math.random() * 4) * 90, // 0, 90, 180, 270
                correctRotation: 0
            });
        }
    }

    // Iniciar temporizador
    startTimer();

    // Dibujar rompecabezas
    drawPuzzle();
}

function drawPuzzle() {

    // Marco decorativo del área de juego
    ctx.strokeStyle = '#5603ad';
    ctx.lineWidth = 3;
    ctx.strokeRect(GAME_AREA_X - 5, GAME_AREA_Y - 5, GAME_AREA_WIDTH + 10, GAME_AREA_HEIGHT + 10);

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

        // Dibujar la pieza desde el centro
        ctx.drawImage(
            currentChampionImage,
            piece.sourceX,
            piece.sourceY,
            piece.width,
            piece.height,
            -piece.width / 2,
            -piece.height / 2,
            piece.width,
            piece.height
        );

        ctx.restore();

        // Borde de la pieza (verde si correcta, morado si incorrecta)
        ctx.strokeStyle = isCorrect ? '#03ad56' : '#5603ad';
        ctx.lineWidth = 3;
        ctx.strokeRect(piece.x, piece.y, piece.width, piece.height);
    });
}

// ========================================================================================
// INTERACCIÓN CON EL CANVAS
// ========================================================================================

function handleCanvasClick(e) {
    if (currentGameState !== 'PUZZLE') return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedPiece = getPieceAtPosition(x, y);
    if (clickedPiece) {
        // Rotar a la izquierda (sentido antihorario)
        clickedPiece.rotation = (clickedPiece.rotation - 90 + 360) % 360;
        drawPuzzle();
        checkPuzzleComplete();
    }
}

function handleCanvasRightClick(e) {
    e.preventDefault();
    if (currentGameState !== 'PUZZLE') return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedPiece = getPieceAtPosition(x, y);
    if (clickedPiece) {
        // Rotar a la derecha (sentido horario)
        clickedPiece.rotation = (clickedPiece.rotation + 90) % 360;
        drawPuzzle();
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

    if (allCorrect) {
        stopTimer();
        // Redibujar sin filtro de grises para mostrar la imagen completa
        drawPuzzleComplete();
        setTimeout(() => {
            showVictory();
        }, 1500);
    }
}

function drawPuzzleComplete() {
    // Marco decorativo del área de juego
    ctx.strokeStyle = '#03ad56';
    ctx.lineWidth = 5;
    ctx.strokeRect(GAME_AREA_X - 5, GAME_AREA_Y - 5, GAME_AREA_WIDTH + 10, GAME_AREA_HEIGHT + 10);

    // Dibujar la imagen completa sin filtros ni rotaciones
    drawImageCover(
        ctx,
        currentChampionImage,
        GAME_AREA_X,
        GAME_AREA_Y,
        GAME_AREA_WIDTH,
        GAME_AREA_HEIGHT
    );

    // Efecto de brillo de victoria
    ctx.save();
    ctx.strokeStyle = '#03ad56';
    ctx.lineWidth = 8;
    ctx.shadowColor = '#03ad56';
    ctx.shadowBlur = 20;
    ctx.strokeRect(GAME_AREA_X, GAME_AREA_Y, GAME_AREA_WIDTH, GAME_AREA_HEIGHT);
    ctx.restore();
}

// ========================================================================================
// TEMPORIZADOR
// ========================================================================================

function startTimer() {
    startTime = Date.now();
    elapsedTime = 0;

    timerInterval = setInterval(() => {
        elapsedTime = Date.now() - startTime;
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
    const seconds = Math.floor(elapsedTime / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    const timeString = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    timerDisplay.textContent = timeString;
}

function showVictory() {
    const seconds = Math.floor(elapsedTime / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    const timeString = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    finalTimeDisplay.textContent = timeString;

    showScreen('VICTORY');
}

// ========================================================================================
// DIBUJAR CANVAS INICIAL
// ========================================================================================

function drawCanvas() {
    ctx.lineWidth = 5;
    ctx.strokeRect(10, 10, CANVAS_WIDTH - 20, CANVAS_HEIGHT - 20);

    // Texto centrado
    ctx.font = 'bold 48px "Titillium Web", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BLOCKA LEAGUE OF LEGENDS', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
}

// ========================================================================================
// INICIO DE LA APLICACIÓN
// ========================================================================================

window.addEventListener('DOMContentLoaded', init);
