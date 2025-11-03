// ========================================================================================
// CONTROLADOR - PegController.js
// Mediador entre Model y View (ellos NO se conocen entre sí)
// ========================================================================================

class PegController {
  constructor(model, view, canvas) {
    this.model = model;
    this.view = view;
    this.canvas = canvas;

    // Estado del drag and drop
    this.isDragging = false;
    this.draggedChip = null; // {row, col}
    this.dragPosition = null; // {x, y} posición del mouse

    // Estado del juego
    this.gameState = 'playing'; // 'playing', 'victory', 'defeat', 'timeup'

    // Bind de los event handlers
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.updateTimer = this.updateTimer.bind(this);
    this.handleButtonInteraction = this.handleButtonInteraction.bind(this);
  }

  // ========================================================================================
  // INICIALIZACIÓN
  // ========================================================================================

  init() {
    // Eventos de drag and drop
    this.canvas.addEventListener("mousedown", this.handleMouseDown);
    this.canvas.addEventListener("mousemove", this.handleMouseMove);
    this.canvas.addEventListener("mouseup", this.handleMouseUp);

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
  // MANEJO DE EVENTOS - DRAG AND DROP
  // ========================================================================================

  handleMouseDown(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Si estamos en pantalla de fin de juego, solo manejar botones
    if (this.gameState !== 'playing') {
      this.handleButtonInteraction(x, y, 'click');
      return;
    }

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
    if (!cellData || !cellData.hasChip()) return;

    // Iniciar drag and drop
    this.isDragging = true;
    this.draggedChip = { row, col };
    this.dragPosition = { x, y };

    // Seleccionar la ficha en el modelo
    this.model.selectCell(row, col);
    this.redraw();
  }

  handleMouseMove(event) {
    if (!this.isDragging || !this.draggedChip) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Actualizar la posición del drag
    this.dragPosition = { x, y };

    // Redibujar para mostrar la ficha moviéndose
    this.redraw();
  }

  handleMouseUp(event) {
    if (!this.isDragging || !this.draggedChip) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convertir coordenadas a celda del tablero
    const cell = this.view.canvasToCell(x, y);

    if (cell) {
      const { row, col } = cell;
      const cellData = this.model.getCellAt(row, col);

      // Intentar mover la ficha
      if (cellData && cellData.value === 0) {
        const moved = this.model.moveChip(
          this.draggedChip.row,
          this.draggedChip.col,
          row,
          col
        );

        if (moved) {
          // Resetear estado de drag
          this.isDragging = false;
          this.draggedChip = null;
          this.dragPosition = null;

          this.redraw();

          // Verificar victoria
          if (this.model.checkWin()) {
            this.handleWin();
          }
          // Verificar derrota (no hay más movimientos)
          else if (!this.model.hasValidMoves()) {
            this.handleLoss();
          }
          return;
        }
      }
    }

    // Si no se pudo mover o no hay celda válida, cancelar el drag
    this.model.deselectAllChips();
    this.isDragging = false;
    this.draggedChip = null;
    this.dragPosition = null;
    this.redraw();
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

    // Datos del drag and drop
    const dragData = {
      isDragging: this.isDragging,
      draggedChip: this.draggedChip,
      dragPosition: this.dragPosition,
    };

    // Pasar los datos a la VISTA para renderizar
    this.view.draw(boardState, timerData, remainingChips, validMoves, dragData);
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
    this.gameState = 'playing';
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

    this.gameState = 'timeup';
    this.drawTimeUpScreen();
  }

  handleWin() {
    this.model.stopTimer();
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.gameState = 'victory';
    this.drawVictoryScreen();
  }

  handleLoss() {
    this.model.stopTimer();
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.gameState = 'defeat';
    this.drawDefeatScreen();
  }

  // ========================================================================================
  // PANTALLAS DE FIN DE JUEGO (solo llaman a la vista)
  // ========================================================================================

  drawVictoryScreen() {
    const timerData = this.model.getTimerData();
    this.view.drawVictoryScreen(
      timerData,
      () => this.restart(),
      () => this.backToRoulette()
    );
  }

  drawDefeatScreen() {
    const remaining = this.model.getRemainingChips();
    const timerData = this.model.getTimerData();
    this.view.drawDefeatScreen(
      remaining,
      timerData,
      () => this.restart(),
      () => this.backToRoulette()
    );
  }

  drawTimeUpScreen() {
    const remaining = this.model.getRemainingChips();
    this.view.drawTimeUpScreen(
      remaining,
      () => this.restart(),
      () => this.backToRoulette()
    );
  }

  handleButtonInteraction(x, y, type) {
    if (type === 'click') {
      // Obtener botones de la vista
      const buttons = this.view.getEndGameButtons();
      for (const btn of buttons) {
        if (btn.isPointInside(x, y)) {
          btn.handleClick();
          return;
        }
      }
    }
  }

  // ========================================================================================
  // DESTRUCCIÓN
  // ========================================================================================

  destroy() {
    this.canvas.removeEventListener("mousedown", this.handleMouseDown);
    this.canvas.removeEventListener("mousemove", this.handleMouseMove);
    this.canvas.removeEventListener("mouseup", this.handleMouseUp);
    this.model.stopTimer();
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}
