const canvas = document.getElementById("canvas-game-peg");
const ctx = canvas.getContext("2d");
const CANVAS_WIDTH_PEG = canvas.width;
const CANVAS_HEIGHT_PEG = canvas.height;

document.addEventListener("DOMContentLoaded", () => {
  // Dimensiones del tablero
  const BOARD_COLS = 7;
  const BOARD_ROWS = 7;
  const CELL_SIZE = 40;
  const boardWidth = BOARD_COLS * CELL_SIZE;   // 280px
  const boardHeight = BOARD_ROWS * CELL_SIZE;  // 280px
  
  // Calcular posición centrada
  const centerX = (CANVAS_WIDTH_PEG - boardWidth) / 2;
  const centerY = (CANVAS_HEIGHT_PEG - boardHeight) / 2;
  
  // Crear tablero centrado
  const tablero1 = new Board(
    centerX,  // x centrada
    centerY,  // y centrada
    CANVAS_WIDTH_PEG,
    CANVAS_HEIGHT_PEG,
    ctx
  );
  
  tablero1.initialize();
  
  // Cargar imagen del tablero y dibujar
  tablero1.loadBackgroundImage(() => {
    drawAll();
  });
  
  function drawAll() {
    clearCanvas();
    tablero1.draw();
  }
});

function clearCanvas() {
  ctx.clearRect(0, 0, CANVAS_WIDTH_PEG, CANVAS_HEIGHT_PEG);
  
  // Fondo con gradiente
  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT_PEG);
  gradient.addColorStop(0, "#100527");
  gradient.addColorStop(0.5, "#3a0477");
  gradient.addColorStop(1, "#100527");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH_PEG, CANVAS_HEIGHT_PEG);
}