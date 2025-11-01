// ========================================================================================
// CONTROLADOR - PegController.js
// Mediador entre Model y View (ellos NO se conocen entre sí)
// ========================================================================================

class PegController {
  constructor(model, view, canvas) {
    this.model = model;
    this.view = view;
    this.canvas = canvas;

    // Bind de los event handlers
    this.handleClick = this.handleClick.bind(this);
    this.updateTimer = this.updateTimer.bind(this);
  }

  // ========================================================================================
  // INICIALIZACIÓN
  // ========================================================================================

  init() {
    this.canvas.addEventListener("click", this.handleClick);

    // Iniciar el timer
    this.model.startTimer();

    // Loop de actualización del timer
    this.startUpdateLoop();

    // Primer dibujado
    this.redraw();
  }

  startUpdateLoop() {
    this.updateInterval = setInterval(this.updateTimer, 100);
  }

  updateTimer() {
    // Verificar si se acabó el tiempo
    if (this.model.isTimeUp()) {
      this.handleTimeUp();
      return;
    }

    // Redibujar solo el HUD (optimización)
    this.redraw();
  }

  // ========================================================================================
  // MANEJO DE EVENTOS
  // ========================================================================================

  handleClick(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Verificar si se hizo clic en el botón de reiniciar
    if (this.view.isRestartButtonClicked(x, y)) {
      this.restart();
      return;
    }

    // Verificar si se hizo clic en el botón de volver
    if (this.view.isBackButtonClicked(x, y)) {
      this.backToRoulette();
      return;
    }

    // Convertir coordenadas a celda del tablero
    const cell = this.view.canvasToCell(x, y);
    if (!cell) return;

    const { row, col } = cell;
    const cellData = this.model.getCellAt(row, col);
    if (!cellData) return;

    // Lógica de selección y movimiento
    this.handleCellClick(row, col, cellData);
  }

  handleCellClick(row, col, cellData) {
    // Si no hay ficha seleccionada
    if (!this.model.selectedCell) {
      // Intentar seleccionar una ficha
      if (cellData.hasChip()) {
        this.model.selectCell(row, col);
        this.redraw();
      }
    } else {
      // Ya hay una ficha seleccionada
      const selectedRow = this.model.selectedCell.row;
      const selectedCol = this.model.selectedCell.col;

      if (cellData.hasChip()) {
        // Seleccionar otra ficha
        this.model.selectCell(row, col);
        this.redraw();
      } else if (cellData.value === 0) {
        // Intentar mover a un espacio vacío
        const moved = this.model.moveChip(selectedRow, selectedCol, row, col);

        if (moved) {
          this.redraw();

          // Verificar victoria
          if (this.model.checkWin()) {
            this.handleWin();
          }
          // Verificar derrota (no hay más movimientos)
          else if (!this.model.hasValidMoves()) {
            this.handleLoss();
          }
        } else {
          // Click inválido, deseleccionar
          this.model.deselectAllChips();
          this.redraw();
        }
      }
    }
  }

  // ========================================================================================
  // RENDERIZADO (Mediador: obtiene datos del modelo y los pasa a la vista)
  // ========================================================================================

  redraw() {
    // Limpiar el canvas primero
    this.clearCanvas();

    // Obtener datos del MODELO
    const boardState = this.model.getBoardState();
    const timerData = this.model.getTimerData();
    const remainingChips = this.model.getRemainingChips();

    // Obtener movimientos válidos si hay ficha seleccionada
    let validMoves = [];
    if (this.model.selectedCell) {
      validMoves = this.model.getValidMovesFrom(
        this.model.selectedCell.row,
        this.model.selectedCell.col
      );
    }

    // Pasar los datos a la VISTA para renderizar
    this.view.draw(boardState, timerData, remainingChips, validMoves);
  }

  clearCanvas() {
    const ctx = this.view.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Fondo con gradiente morado
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#100527");
    gradient.addColorStop(0.5, "#3a0477");
    gradient.addColorStop(1, "#100527");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Estrellas de fondo
    this.drawBackgroundStars(ctx, width, height);

    // Viñeta
    this.drawVignette(ctx, width, height);
  }

  drawBackgroundStars(ctx, width, height) {
    ctx.save();

    const seed = 12345;
    const random = (function (s) {
      return function () {
        s = Math.sin(s) * 10000;
        return s - Math.floor(s);
      };
    })(seed);

    for (let i = 0; i < 50; i++) {
      const x = random() * width;
      const y = random() * height;
      const size = random() * 2 + 0.5;
      const opacity = random() * 0.5 + 0.2;

      ctx.fillStyle = `rgba(138, 56, 245, ${opacity})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();

      if (i % 5 === 0) {
        ctx.shadowColor = "#8a38f5";
        ctx.shadowBlur = 5;
        ctx.fillStyle = `rgba(247, 183, 49, ${opacity * 0.8})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    ctx.restore();
  }

  drawVignette(ctx, width, height) {
    const vignetteGradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(width, height) / 3,
      width / 2,
      height / 2,
      Math.max(width, height) / 1.2
    );

    vignetteGradient.addColorStop(0, "transparent");
    vignetteGradient.addColorStop(0.7, "rgba(16, 5, 39, 0.3)");
    vignetteGradient.addColorStop(1, "rgba(16, 5, 39, 0.7)");

    ctx.fillStyle = vignetteGradient;
    ctx.fillRect(0, 0, width, height);
  }

  // ========================================================================================
  // EVENTOS DE JUEGO
  // ========================================================================================

  restart() {
    this.model.reset();
    this.redraw();
  }

  backToRoulette() {
    // Detener el juego
    this.destroy();

    // Llamar a la función global para volver a la ruleta
    backToRouletteScreen();
  }

  handleTimeUp() {
    this.model.stopTimer();
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    setTimeout(() => {
      const remaining = this.model.getRemainingChips();
      alert(
        `⏰ ¡SE ACABÓ EL TIEMPO!\n\nFichas restantes: ${remaining}\n\n¡Inténtalo de nuevo!`
      );
    }, 100);
  }

  handleWin() {
    this.model.stopTimer();
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    setTimeout(() => {
      const timerData = this.model.getTimerData();
      alert(
        `¡GANASTE! 🎉\n\nTiempo: ${timerData.formattedTime}\n\n¡Solo queda 1 ficha en el centro!`
      );
    }, 100);
  }

  handleLoss() {
    this.model.stopTimer();
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    setTimeout(() => {
      const remaining = this.model.getRemainingChips();
      const timerData = this.model.getTimerData();
      alert(
        `Juego terminado ⏹️\n\nTiempo: ${timerData.formattedTime}\nFichas restantes: ${remaining}\n\nNo hay más movimientos disponibles.`
      );
    }, 100);
  }

  // ========================================================================================
  // DESTRUCCIÓN
  // ========================================================================================

  destroy() {
    this.canvas.removeEventListener("click", this.handleClick);
    this.model.stopTimer();
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}
