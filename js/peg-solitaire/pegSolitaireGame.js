// ========================================================================================
// PEG SOLITAIRE GAME - League of Legends Edition
// Sistema completo: Tablero de fichas estratégico
// ========================================================================================

// ========================================================================================
// CONSTANTES Y CONFIGURACIÓN
// ========================================================================================

const CANVAS_WIDTH_PEG = 1340;
const CANVAS_HEIGHT_PEG = 507;

// ========================================================================================
// VARIABLES GLOBALES
// ========================================================================================

let canvasPeg, ctxPeg;
let tablero = null;
let roulette = null;
let selectedChipImage = null;
let gameState = 'roulette'; // 'roulette' o 'playing'
let showSpinButton = true;

// ========================================================================================
// INICIALIZACIÓN
// ========================================================================================

function initPegSolitaire() {
    canvasPeg = document.getElementById('canvas-game-peg');

    // Verificar que el canvas existe
    if (!canvasPeg) {
        console.error('Canvas element not found');
        return;
    }

    ctxPeg = canvasPeg.getContext('2d');

    // Dimensiones del tablero
    const BOARD_COLS = 7;
    const BOARD_ROWS = 7;
    const CELL_SIZE = 40;
    const boardWidth = BOARD_COLS * CELL_SIZE;
    const boardHeight = BOARD_ROWS * CELL_SIZE;

    // Calcular posición centrada
    const centerX = (CANVAS_WIDTH_PEG - boardWidth) / 2;
    const centerY = (CANVAS_HEIGHT_PEG - boardHeight) / 2;

    // Crear tablero centrado
    tablero = new Board(
        centerX,
        centerY,
        CANVAS_WIDTH_PEG,
        CANVAS_HEIGHT_PEG,
        ctxPeg
    );

    tablero.initialize();

    // Crear la ruleta centrada horizontalmente, pero más abajo para dejar espacio al título
    const rouletteX = CANVAS_WIDTH_PEG / 2;
    const rouletteY = CANVAS_HEIGHT_PEG / 2 + 30; // Bajar 30px para el título
    const rouletteRadius = 130;
    roulette = new Roulette(rouletteX, rouletteY, rouletteRadius, ctxPeg);

    // Callback cuando termina el giro
    roulette.onSpinComplete = (chipPath) => {
        selectedChipImage = roulette.getSelectedChipImage();

        // Actualizar todas las fichas del tablero con la imagen seleccionada
        if (selectedChipImage) {
            tablero.setChipImage(selectedChipImage);
        }

        // Redibujar para mostrar el mensaje de resultado
        drawAll();

        // Esperar 3 segundos mostrando el resultado, luego cambiar al juego
        setTimeout(() => {
            gameState = 'playing';
            roulette.hide();
            drawAll();
        }, 3000);
    };

    // Event listener para click en el canvas
    canvasPeg.addEventListener('click', handleCanvasClick);

    // Cargar imagen del tablero
    tablero.loadBackgroundImage(() => {
        // Mostrar la ruleta (SIN girar automáticamente)
        roulette.show();
        drawAll();
    });
}

function drawAll() {
    clearCanvasPeg();

    if (gameState === 'roulette') {
        // Solo mostrar la ruleta
        if (roulette && roulette.visible) {
            // Fondo degradado estilo slot machine
            const bgGradient = ctxPeg.createLinearGradient(0, 0, 0, CANVAS_HEIGHT_PEG);
            bgGradient.addColorStop(0, '#2d0052');
            bgGradient.addColorStop(1, '#1a0033');
            ctxPeg.fillStyle = bgGradient;
            ctxPeg.fillRect(0, 0, CANVAS_WIDTH_PEG, CANVAS_HEIGHT_PEG);

            // Marco/container de la ruleta estilo slot
            drawRouletteContainer();

            // Título (solo si no está girando)
            if (!roulette.spinning) {
                drawRouletteTitle();
            }

            // Dibujar la ruleta
            roulette.draw();

            // Botón de girar (solo si no está girando y no hay resultado)
            if (showSpinButton && !roulette.spinning && !selectedChipImage) {
                drawSpinButton();
            }

            // Mostrar mensaje de resultado si terminó de girar
            if (!roulette.spinning && selectedChipImage) {
                drawResultMessage();
            }
        }

        // Actualizar la ruleta si está girando
        if (roulette && roulette.spinning) {
            roulette.update();
            requestAnimationFrame(drawAll);
        }
    } else if (gameState === 'playing') {
        // Mostrar el tablero del juego
        tablero.draw();
    }
}

function clearCanvasPeg() {
    ctxPeg.clearRect(0, 0, CANVAS_WIDTH_PEG, CANVAS_HEIGHT_PEG);

    // Fondo con gradiente morado mejorado (mismo estilo que blockaGame)
    const gradient = ctxPeg.createLinearGradient(0, 0, 0, CANVAS_HEIGHT_PEG);
    gradient.addColorStop(0, '#100527');
    gradient.addColorStop(0.5, '#3a0477');
    gradient.addColorStop(1, '#100527');
    ctxPeg.fillStyle = gradient;
    ctxPeg.fillRect(0, 0, CANVAS_WIDTH_PEG, CANVAS_HEIGHT_PEG);

    // Agregar efecto de partículas/estrellas de fondo
    drawBackgroundStars();

    // Efecto de viñeta (oscurecimiento en los bordes)
    drawVignette();
}

function drawBackgroundStars() {
    // Dibujar pequeñas estrellas/partículas en el fondo
    ctxPeg.save();

    // Generar posiciones "aleatorias" pero consistentes basadas en el canvas
    const seed = 12345;
    const random = (function(s) {
        return function() {
            s = Math.sin(s) * 10000;
            return s - Math.floor(s);
        };
    })(seed);

    for (let i = 0; i < 50; i++) {
        const x = random() * CANVAS_WIDTH_PEG;
        const y = random() * CANVAS_HEIGHT_PEG;
        const size = random() * 2 + 0.5;
        const opacity = random() * 0.5 + 0.2;

        ctxPeg.fillStyle = `rgba(138, 56, 245, ${opacity})`;
        ctxPeg.beginPath();
        ctxPeg.arc(x, y, size, 0, Math.PI * 2);
        ctxPeg.fill();

        // Algunos con brillo
        if (i % 5 === 0) {
            ctxPeg.shadowColor = '#8a38f5';
            ctxPeg.shadowBlur = 5;
            ctxPeg.fillStyle = `rgba(247, 183, 49, ${opacity * 0.8})`;
            ctxPeg.beginPath();
            ctxPeg.arc(x, y, size, 0, Math.PI * 2);
            ctxPeg.fill();
            ctxPeg.shadowBlur = 0;
        }
    }

    ctxPeg.restore();
}

function drawVignette() {
    // Crear efecto de viñeta (oscurecimiento gradual en los bordes)
    const vignetteGradient = ctxPeg.createRadialGradient(
        CANVAS_WIDTH_PEG / 2,
        CANVAS_HEIGHT_PEG / 2,
        Math.min(CANVAS_WIDTH_PEG, CANVAS_HEIGHT_PEG) / 3,
        CANVAS_WIDTH_PEG / 2,
        CANVAS_HEIGHT_PEG / 2,
        Math.max(CANVAS_WIDTH_PEG, CANVAS_HEIGHT_PEG) / 1.2
    );

    vignetteGradient.addColorStop(0, 'transparent');
    vignetteGradient.addColorStop(0.7, 'rgba(16, 5, 39, 0.3)');
    vignetteGradient.addColorStop(1, 'rgba(16, 5, 39, 0.7)');

    ctxPeg.fillStyle = vignetteGradient;
    ctxPeg.fillRect(0, 0, CANVAS_WIDTH_PEG, CANVAS_HEIGHT_PEG);
}

// ========================================================================================
// FUNCIONES DE LA RULETA
// ========================================================================================

function drawRouletteContainer() {
    const containerX = CANVAS_WIDTH_PEG / 2;
    const containerY = CANVAS_HEIGHT_PEG / 2;
    const containerWidth = 700;
    const containerHeight = 550;

    ctxPeg.save();

    // Sombra externa del container
    ctxPeg.shadowColor = 'rgba(0, 255, 136, 0.4)';
    ctxPeg.shadowBlur = 60;

    // Fondo del container
    const bgGradient = ctxPeg.createLinearGradient(
        containerX - containerWidth / 2, containerY - containerHeight / 2,
        containerX - containerWidth / 2, containerY + containerHeight / 2
    );
    bgGradient.addColorStop(0, '#2d0052');
    bgGradient.addColorStop(1, '#1a0033');

    ctxPeg.fillStyle = bgGradient;
    ctxPeg.beginPath();
    ctxPeg.roundRect(
        containerX - containerWidth / 2,
        containerY - containerHeight / 2,
        containerWidth,
        containerHeight,
        30
    );
    ctxPeg.fill();

    // Borde verde brillante estilo slot
    const borderGradient = ctxPeg.createLinearGradient(
        containerX - containerWidth / 2, containerY - containerHeight / 2,
        containerX + containerWidth / 2, containerY + containerHeight / 2
    );
    borderGradient.addColorStop(0, '#00ff88');
    borderGradient.addColorStop(0.5, '#00cc66');
    borderGradient.addColorStop(1, '#00ff88');

    ctxPeg.strokeStyle = borderGradient;
    ctxPeg.lineWidth = 15;
    ctxPeg.stroke();

    // Sombra interna
    ctxPeg.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctxPeg.shadowBlur = 40;
    ctxPeg.shadowOffsetX = 0;
    ctxPeg.shadowOffsetY = 0;
    ctxPeg.globalCompositeOperation = 'multiply';
    ctxPeg.fillRect(
        containerX - containerWidth / 2 + 15,
        containerY - containerHeight / 2 + 15,
        containerWidth - 30,
        containerHeight - 30
    );
    ctxPeg.globalCompositeOperation = 'source-over';

    ctxPeg.restore();
}

function drawRouletteTitle() {
    ctxPeg.save();

    // Título estilo "★ SLOT MACHINE ★"
    ctxPeg.font = 'bold 48px Arial Black';
    ctxPeg.textAlign = 'center';
    ctxPeg.textBaseline = 'middle';

    // Efecto de brillo verde
    ctxPeg.shadowColor = 'rgba(0, 255, 136, 0.6)';
    ctxPeg.shadowBlur = 30;

    // Gradiente verde brillante
    const gradient = ctxPeg.createLinearGradient(
        CANVAS_WIDTH_PEG / 2 - 300, 80,
        CANVAS_WIDTH_PEG / 2 + 300, 80
    );
    gradient.addColorStop(0, '#00ff88');
    gradient.addColorStop(0.5, '#00ffcc');
    gradient.addColorStop(1, '#00ff88');

    ctxPeg.fillStyle = gradient;
    ctxPeg.fillText('★ RULETA DE FICHAS ★', CANVAS_WIDTH_PEG / 2, 80);

    // Animación de brillo pulsante (opcional)
    const pulse = Math.sin(Date.now() / 500) * 0.3 + 0.7;
    ctxPeg.globalAlpha = pulse;
    ctxPeg.fillText('★ RULETA DE FICHAS ★', CANVAS_WIDTH_PEG / 2, 80);

    ctxPeg.restore();
}

function drawSpinButton() {
    const buttonX = CANVAS_WIDTH_PEG / 2;
    const buttonY = CANVAS_HEIGHT_PEG - 80;
    const buttonWidth = 200;
    const buttonHeight = 60;

    ctxPeg.save();

    // Sombra del botón
    ctxPeg.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctxPeg.shadowBlur = 20;
    ctxPeg.shadowOffsetX = 0;
    ctxPeg.shadowOffsetY = 5;

    // Gradiente del botón
    const gradient = ctxPeg.createLinearGradient(
        buttonX - buttonWidth / 2, buttonY - buttonHeight / 2,
        buttonX + buttonWidth / 2, buttonY + buttonHeight / 2
    );
    gradient.addColorStop(0, '#00ff88');
    gradient.addColorStop(1, '#00aa55');

    ctxPeg.fillStyle = gradient;
    ctxPeg.beginPath();
    ctxPeg.roundRect(
        buttonX - buttonWidth / 2,
        buttonY - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        15
    );
    ctxPeg.fill();

    // Borde brillante
    ctxPeg.shadowBlur = 15;
    ctxPeg.shadowColor = '#00ff88';
    ctxPeg.strokeStyle = '#74e0a9';
    ctxPeg.lineWidth = 3;
    ctxPeg.stroke();

    // Texto del botón
    ctxPeg.shadowBlur = 0;
    ctxPeg.fillStyle = '#ffffff';
    ctxPeg.font = 'bold 28px "Titillium Web"';
    ctxPeg.textAlign = 'center';
    ctxPeg.textBaseline = 'middle';
    ctxPeg.fillText('GIRAR', buttonX, buttonY);

    ctxPeg.restore();

    // Guardar bounds del botón
    drawSpinButton.bounds = {
        x: buttonX - buttonWidth / 2,
        y: buttonY - buttonHeight / 2,
        width: buttonWidth,
        height: buttonHeight
    };
}

function handleCanvasClick(event) {
    if (gameState !== 'roulette') return;

    const rect = canvasPeg.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Verificar si se clickeó el botón de girar
    if (showSpinButton && !roulette.spinning && !selectedChipImage && drawSpinButton.bounds) {
        const bounds = drawSpinButton.bounds;
        if (
            mouseX >= bounds.x &&
            mouseX <= bounds.x + bounds.width &&
            mouseY >= bounds.y &&
            mouseY <= bounds.y + bounds.height
        ) {
            // Girar la ruleta
            showSpinButton = false;
            roulette.spin();
            drawAll();
        }
    }
}

function drawResultMessage() {
    const messageX = CANVAS_WIDTH_PEG / 2;
    const messageY = CANVAS_HEIGHT_PEG / 2 + 30;

    ctxPeg.save();

    // Fondo semi-transparente sobre toda la pantalla
    ctxPeg.fillStyle = 'rgba(16, 5, 39, 0.85)';
    ctxPeg.fillRect(0, 0, CANVAS_WIDTH_PEG, CANVAS_HEIGHT_PEG);

    // Título en la parte superior
    ctxPeg.shadowBlur = 20;
    ctxPeg.shadowColor = '#ffd32a';
    ctxPeg.fillStyle = '#ffd32a';
    ctxPeg.font = 'bold 48px "Titillium Web"';
    ctxPeg.textAlign = 'center';
    ctxPeg.textBaseline = 'middle';
    ctxPeg.fillText('¡ESTA ES TU FICHA!', messageX, 80);

    // Dibujar la ficha ganadora grande en el centro
    if (selectedChipImage) {
        const chipSize = 200;

        // Sombra de la ficha
        ctxPeg.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctxPeg.shadowBlur = 40;
        ctxPeg.shadowOffsetX = 0;
        ctxPeg.shadowOffsetY = 15;

        // Círculo de fondo dorado
        const bgGradient = ctxPeg.createRadialGradient(
            messageX, messageY,
            0,
            messageX, messageY,
            chipSize / 2 + 20
        );
        bgGradient.addColorStop(0, '#ffd32a');
        bgGradient.addColorStop(0.7, '#f7b731');
        bgGradient.addColorStop(1, '#e08e00');

        ctxPeg.beginPath();
        ctxPeg.arc(messageX, messageY, chipSize / 2 + 20, 0, Math.PI * 2);
        ctxPeg.fillStyle = bgGradient;
        ctxPeg.fill();

        // Borde brillante
        ctxPeg.strokeStyle = '#fff4d6';
        ctxPeg.lineWidth = 5;
        ctxPeg.shadowBlur = 25;
        ctxPeg.shadowColor = '#ffd32a';
        ctxPeg.stroke();

        // Círculo blanco para la ficha
        ctxPeg.shadowBlur = 0;
        ctxPeg.beginPath();
        ctxPeg.arc(messageX, messageY, chipSize / 2 + 5, 0, Math.PI * 2);
        ctxPeg.fillStyle = '#ffffff';
        ctxPeg.fill();

        // Dibujar la imagen de la ficha
        ctxPeg.shadowColor = 'transparent';
        ctxPeg.drawImage(
            selectedChipImage,
            messageX - chipSize / 2,
            messageY - chipSize / 2,
            chipSize,
            chipSize
        );
    }

    // Subtítulo en la parte inferior
    ctxPeg.shadowBlur = 15;
    ctxPeg.shadowColor = '#74e0a9';
    ctxPeg.fillStyle = '#74e0a9';
    ctxPeg.font = 'bold 28px "Titillium Web"';
    ctxPeg.fillText('Iniciando juego en 3 segundos...', messageX, CANVAS_HEIGHT_PEG - 60);

    ctxPeg.restore();
}

// ========================================================================================
// INICIO DE LA APLICACIÓN
// ========================================================================================

window.addEventListener('DOMContentLoaded', initPegSolitaire);
