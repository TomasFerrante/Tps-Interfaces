// ========================================================================================
// PEG SOLITAIRE GAME - League of Legends Edition
// Sistema completo con arquitectura MVC + HUD con Timer
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

// Variables MVC (reemplazan a 'tablero')
let boardModel = null; // MODELO - lógica del juego
let boardView = null; // VISTA - renderizado
let pegController = null; // CONTROLADOR - eventos

// Ruleta (no es parte del MVC del juego)
let roulette = null;
let selectedChipImage = null;
let gameState = "roulette"; // 'roulette' o 'playing'
let showSpinButton = true;

// ========================================================================================
// INICIALIZACIÓN
// ========================================================================================

function initPegSolitaire() {
  canvasPeg = document.getElementById("canvas-game-peg");

  if (!canvasPeg) {
    console.error("Canvas element not found");
    return;
  }

  ctxPeg = canvasPeg.getContext("2d");

  // Dimensiones del tablero
  const CELL_SIZE = 55;
  const boardWidth = 7 * CELL_SIZE;
  const boardHeight = 7 * CELL_SIZE;

  // Calcular posición centrada
  const centerX = (CANVAS_WIDTH_PEG - boardWidth) / 2;
  const centerY = (CANVAS_HEIGHT_PEG - boardHeight) / 2;

  // Crear MODELO (solo lógica, sin visuales)
  boardModel = new Board();

  // Crear VISTA (solo renderizado, sin lógica)
  boardView = new BoardView(ctxPeg, centerX, centerY, CELL_SIZE);

  // El CONTROLADOR se creará después de la ruleta

  // Crear la ruleta
  const rouletteX = CANVAS_WIDTH_PEG / 2;
  const rouletteY = CANVAS_HEIGHT_PEG / 2 + 30;
  const rouletteRadius = 130;
  roulette = new Roulette(rouletteX, rouletteY, rouletteRadius, ctxPeg);

  // Callback cuando termina el giro
  roulette.onSpinComplete = (chipPath) => {
    selectedChipImage = roulette.getSelectedChipImage();

    // Actualizar imagen en el MODELO
    if (selectedChipImage) {
      boardModel.setChipImage(selectedChipImage);
    }

    drawAll();

    // Iniciar el juego después de 3 segundos
    setTimeout(() => {
      startGame();
    }, 3000);
  };

  // Event listener SOLO para la ruleta
  canvasPeg.addEventListener("click", handleRouletteClick);

  // Mostrar la ruleta
  roulette.show();
  drawAll();
}

// ========================================================================================
// INICIAR JUEGO (después de la ruleta)
// ========================================================================================

function startGame() {
  gameState = "playing";
  roulette.hide();

  // Remover el event listener de la ruleta
  //canvasPeg.removeEventListener("click", handleRouletteClick);

  // Crear y activar el CONTROLADOR
  if (!pegController) {
    pegController = new PegController(boardModel, boardView, canvasPeg);
    pegController.init(); // Activa los event listeners del juego e inicia el timer
  }
}

// ========================================================================================
// VOLVER A LA RULETA
// ========================================================================================
function backToRouletteScreen() {
  // Cambiar estado del juego
  gameState = "roulette";

  // Destruir el controlador actual si existe
  if (pegController) {
    pegController.destroy();
    pegController = null;
  }

  // Reiniciar el modelo
  boardModel = new Board();

  // IMPORTANTE: Resetear completamente la ruleta anterior
  if (roulette) {
    roulette.reset();
  }

  // Resetear variables de la ruleta
  selectedChipImage = null;
  showSpinButton = true;

  // Reiniciar la ruleta COMPLETAMENTE
  const rouletteX = CANVAS_WIDTH_PEG / 2;
  const rouletteY = CANVAS_HEIGHT_PEG / 2 + 30;
  const rouletteRadius = 130;
  
  // Crear una nueva instancia de la ruleta
  roulette = new Roulette(rouletteX, rouletteY, rouletteRadius, ctxPeg);
  
  // Configurar el callback nuevamente
  roulette.onSpinComplete = (chipPath) => {
    selectedChipImage = roulette.getSelectedChipImage();
    if (selectedChipImage) {
      boardModel.setChipImage(selectedChipImage);
    }
    drawAll();
    setTimeout(() => {
      startGame();
    }, 3000);
  };

  // Mostrar la ruleta
  roulette.show();

  // Reactivar el event listener de la ruleta
  // (no lo vuelvas a agregar si ya existe)

  // LIMPIEZA TOTAL del canvas
  ctxPeg.save();
  ctxPeg.setTransform(1, 0, 0, 1, 0, 0); // Reset transformaciones
  ctxPeg.clearRect(0, 0, CANVAS_WIDTH_PEG, CANVAS_HEIGHT_PEG);
  ctxPeg.restore();
  
  // Dibujar la pantalla de la ruleta
  drawAll();
}

// ========================================================================================
// FUNCIONES DE DIBUJO GENERALES
// ========================================================================================

function drawAll() {
  clearCanvasPeg();

  if (gameState === "roulette") {
    drawRouletteScreen();
  } else if (gameState === "playing") {
    // El controlador maneja el dibujo del juego
    if (pegController) {
      pegController.redraw();
    }
  }
}

function drawRouletteScreen() {
  if (roulette && roulette.visible) {
    // Fondo degradado estilo slot machine
    const bgGradient = ctxPeg.createLinearGradient(0, 0, 0, CANVAS_HEIGHT_PEG);
    bgGradient.addColorStop(0, "#2d0052");
    bgGradient.addColorStop(1, "#1a0033");
    ctxPeg.fillStyle = bgGradient;
    ctxPeg.fillRect(0, 0, CANVAS_WIDTH_PEG, CANVAS_HEIGHT_PEG);

    drawRouletteContainer();

    if (!roulette.spinning) {
      drawRouletteTitle();
    }

    roulette.draw();

    if (showSpinButton && !roulette.spinning && !selectedChipImage) {
      drawSpinButton();
    }

    if (!roulette.spinning && selectedChipImage) {
      drawResultMessage();
    }
  }

  // Actualizar animación de la ruleta
  if (roulette && roulette.spinning) {
    roulette.update();
    requestAnimationFrame(drawAll);
  }
}

function clearCanvasPeg() {
  // Limpieza completa del canvas
  ctxPeg.save();
  ctxPeg.setTransform(1, 0, 0, 1, 0, 0); // Reset de transformaciones
  ctxPeg.clearRect(0, 0, CANVAS_WIDTH_PEG, CANVAS_HEIGHT_PEG);
  ctxPeg.restore();

  // Fondo con gradiente morado
  const gradient = ctxPeg.createLinearGradient(0, 0, 0, CANVAS_HEIGHT_PEG);
  gradient.addColorStop(0, "#100527");
  gradient.addColorStop(0.5, "#3a0477");
  gradient.addColorStop(1, "#100527");
  ctxPeg.fillStyle = gradient;
  ctxPeg.fillRect(0, 0, CANVAS_WIDTH_PEG, CANVAS_HEIGHT_PEG);

  drawBackgroundStars();
  drawVignette();
}

function drawBackgroundStars() {
  ctxPeg.save();

  const seed = 12345;
  const random = (function (s) {
    return function () {
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

    if (i % 5 === 0) {
      ctxPeg.shadowColor = "#8a38f5";
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
  const vignetteGradient = ctxPeg.createRadialGradient(
    CANVAS_WIDTH_PEG / 2,
    CANVAS_HEIGHT_PEG / 2,
    Math.min(CANVAS_WIDTH_PEG, CANVAS_HEIGHT_PEG) / 3,
    CANVAS_WIDTH_PEG / 2,
    CANVAS_HEIGHT_PEG / 2,
    Math.max(CANVAS_WIDTH_PEG, CANVAS_HEIGHT_PEG) / 1.2
  );

  vignetteGradient.addColorStop(0, "transparent");
  vignetteGradient.addColorStop(0.7, "rgba(16, 5, 39, 0.3)");
  vignetteGradient.addColorStop(1, "rgba(16, 5, 39, 0.7)");

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

  ctxPeg.shadowColor = "rgba(0, 255, 136, 0.4)";
  ctxPeg.shadowBlur = 60;

  const bgGradient = ctxPeg.createLinearGradient(
    containerX - containerWidth / 2,
    containerY - containerHeight / 2,
    containerX - containerWidth / 2,
    containerY + containerHeight / 2
  );
  bgGradient.addColorStop(0, "#2d0052");
  bgGradient.addColorStop(1, "#1a0033");

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

  const borderGradient = ctxPeg.createLinearGradient(
    containerX - containerWidth / 2,
    containerY - containerHeight / 2,
    containerX + containerWidth / 2,
    containerY + containerHeight / 2
  );
  borderGradient.addColorStop(0, "#00ff88");
  borderGradient.addColorStop(0.5, "#00cc66");
  borderGradient.addColorStop(1, "#00ff88");

  ctxPeg.strokeStyle = borderGradient;
  ctxPeg.lineWidth = 15;
  ctxPeg.stroke();

  ctxPeg.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctxPeg.shadowBlur = 40;
  ctxPeg.shadowOffsetX = 0;
  ctxPeg.shadowOffsetY = 0;
  ctxPeg.globalCompositeOperation = "multiply";
  ctxPeg.fillRect(
    containerX - containerWidth / 2 + 15,
    containerY - containerHeight / 2 + 15,
    containerWidth - 30,
    containerHeight - 30
  );
  ctxPeg.globalCompositeOperation = "source-over";

  ctxPeg.restore();
}

function drawRouletteTitle() {
  ctxPeg.save();

  ctxPeg.font = "bold 48px Arial Black";
  ctxPeg.textAlign = "center";
  ctxPeg.textBaseline = "middle";

  ctxPeg.shadowColor = "rgba(0, 255, 136, 0.6)";
  ctxPeg.shadowBlur = 30;

  const gradient = ctxPeg.createLinearGradient(
    CANVAS_WIDTH_PEG / 2 - 300,
    80,
    CANVAS_WIDTH_PEG / 2 + 300,
    80
  );
  gradient.addColorStop(0, "#00ff88");
  gradient.addColorStop(0.5, "#00ffcc");
  gradient.addColorStop(1, "#00ff88");

  ctxPeg.fillStyle = gradient;
  ctxPeg.fillText("☆ RULETA DE FICHAS ☆", CANVAS_WIDTH_PEG / 2, 80);

  const pulse = Math.sin(Date.now() / 500) * 0.3 + 0.7;
  ctxPeg.globalAlpha = pulse;
  ctxPeg.fillText("☆ RULETA DE FICHAS ☆", CANVAS_WIDTH_PEG / 2, 80);

  ctxPeg.restore();
}

function drawSpinButton() {
  const buttonX = CANVAS_WIDTH_PEG / 2;
  const buttonY = CANVAS_HEIGHT_PEG - 80;
  const buttonWidth = 200;
  const buttonHeight = 60;

  ctxPeg.save();

  ctxPeg.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctxPeg.shadowBlur = 20;
  ctxPeg.shadowOffsetX = 0;
  ctxPeg.shadowOffsetY = 5;

  const gradient = ctxPeg.createLinearGradient(
    buttonX - buttonWidth / 2,
    buttonY - buttonHeight / 2,
    buttonX + buttonWidth / 2,
    buttonY + buttonHeight / 2
  );
  gradient.addColorStop(0, "#00ff88");
  gradient.addColorStop(1, "#00aa55");

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

  ctxPeg.shadowBlur = 15;
  ctxPeg.shadowColor = "#00ff88";
  ctxPeg.strokeStyle = "#74e0a9";
  ctxPeg.lineWidth = 3;
  ctxPeg.stroke();

  ctxPeg.shadowBlur = 0;
  ctxPeg.fillStyle = "#ffffff";
  ctxPeg.font = 'bold 28px "Titillium Web"';
  ctxPeg.textAlign = "center";
  ctxPeg.textBaseline = "middle";
  ctxPeg.fillText("GIRAR", buttonX, buttonY);

  ctxPeg.restore();

  drawSpinButton.bounds = {
    x: buttonX - buttonWidth / 2,
    y: buttonY - buttonHeight / 2,
    width: buttonWidth,
    height: buttonHeight,
  };
}

function handleRouletteClick(event) {
  if (gameState !== "roulette") return;

  const rect = canvasPeg.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  if (
    showSpinButton &&
    !roulette.spinning &&
    !selectedChipImage &&
    drawSpinButton.bounds
  ) {
    const bounds = drawSpinButton.bounds;
    if (
      mouseX >= bounds.x &&
      mouseX <= bounds.x + bounds.width &&
      mouseY >= bounds.y &&
      mouseY <= bounds.y + bounds.height
    ) {
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

  ctxPeg.fillStyle = "rgba(16, 5, 39, 0.85)";
  ctxPeg.fillRect(0, 0, CANVAS_WIDTH_PEG, CANVAS_HEIGHT_PEG);

  ctxPeg.shadowBlur = 20;
  ctxPeg.shadowColor = "#ffd32a";
  ctxPeg.fillStyle = "#ffd32a";
  ctxPeg.font = 'bold 48px "Titillium Web"';
  ctxPeg.textAlign = "center";
  ctxPeg.textBaseline = "middle";
  ctxPeg.fillText("¡ESTA ES TU FICHA!", messageX, 80);

  if (selectedChipImage) {
    const chipSize = 280;

    ctxPeg.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctxPeg.shadowBlur = 40;
    ctxPeg.shadowOffsetX = 0;
    ctxPeg.shadowOffsetY = 15;

    const bgGradient = ctxPeg.createRadialGradient(
      messageX,
      messageY,
      0,
      messageX,
      messageY,
      chipSize / 2 + 20
    );
    bgGradient.addColorStop(0, "#ffd32a");
    bgGradient.addColorStop(0.7, "#f7b731");
    bgGradient.addColorStop(1, "#e08e00");

    ctxPeg.beginPath();
    ctxPeg.arc(messageX, messageY, chipSize / 2 + 20, 0, Math.PI * 2);
    ctxPeg.fillStyle = bgGradient;
    ctxPeg.fill();

    ctxPeg.strokeStyle = "#fff4d6";
    ctxPeg.lineWidth = 5;
    ctxPeg.shadowBlur = 25;
    ctxPeg.shadowColor = "#ffd32a";
    ctxPeg.stroke();

    ctxPeg.shadowBlur = 0;
    ctxPeg.beginPath();
    ctxPeg.arc(messageX, messageY, chipSize / 2 + 5, 0, Math.PI * 2);
    ctxPeg.fillStyle = "#ffffff";
    ctxPeg.fill();

    ctxPeg.shadowColor = "transparent";
    ctxPeg.drawImage(
      selectedChipImage,
      messageX - chipSize / 2,
      messageY - chipSize / 2,
      chipSize,
      chipSize
    );
  }

  ctxPeg.shadowBlur = 15;
  ctxPeg.shadowColor = "#74e0a9";
  ctxPeg.fillStyle = "#74e0a9";
  ctxPeg.font = 'bold 28px "Titillium Web"';
  ctxPeg.fillText(
    "Iniciando juego en 3 segundos...",
    messageX,
    CANVAS_HEIGHT_PEG - 60
  );

  ctxPeg.restore();
}

// ========================================================================================
// INICIO DE LA APLICACIÓN
// ========================================================================================

window.addEventListener("DOMContentLoaded", initPegSolitaire);
