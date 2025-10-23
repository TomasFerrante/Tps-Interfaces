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

    // Cargar imagen del tablero y dibujar
    tablero.loadBackgroundImage(() => {
        drawAll();
    });
}

function drawAll() {
    clearCanvasPeg();
    tablero.draw();
}

function clearCanvasPeg() {
    ctxPeg.clearRect(0, 0, CANVAS_WIDTH_PEG, CANVAS_HEIGHT_PEG);

    // Fondo con gradiente morado (mismo estilo que blockaGame)
    const gradient = ctxPeg.createLinearGradient(0, 0, 0, CANVAS_HEIGHT_PEG);
    gradient.addColorStop(0, '#100527');
    gradient.addColorStop(0.5, '#3a0477');
    gradient.addColorStop(1, '#100527');
    ctxPeg.fillStyle = gradient;
    ctxPeg.fillRect(0, 0, CANVAS_WIDTH_PEG, CANVAS_HEIGHT_PEG);
}

// ========================================================================================
// INICIO DE LA APLICACIÓN
// ========================================================================================

window.addEventListener('DOMContentLoaded', initPegSolitaire);
