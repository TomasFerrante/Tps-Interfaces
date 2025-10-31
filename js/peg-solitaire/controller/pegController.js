class PegController {
  constructor(boardModel, boardView, canvas) {
    this.boardModel = boardModel;
    this.boardView = boardView;
    this.canvas = canvas;
    this.selectedChip = null;
    this.draggedChip = null;
    this.dragStartPos = null;
    this.isDragging = false;
    this.gameActive = true;
  }

  init() {
    this.setUpEventListeners();
    this.redraw();
  }

  // Maneja eventos mouse
  setUpEventListeners() {
    this.handleClick = (e) => this.clickHandler(e);
    this.handleMouseMove = (e) => this.mouseMoveHandler(e);
    this.handleMouseUp = (e) => this.mouseUpHandler(e);
    this.handleMouseDown = (e) => this.mouseDownHandler(e);

    // Selected
    this.canvas.addEventListener("click", this.handleClick);
    // Dragged
    this.canvas.addEventListener("mousedown", this.handleMouseDown);
    this.canvas.addEventListener("mousemove", this.handleMouseMove);
    this.canvas.addEventListener("mouseup", this.handleMouseUp);
  }

  mouseDownHandler(e) {
    e.preventDefault();

    if (!this.isDragging || !this.gameActive) return;

    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const logicalPos = this.boardView.screenToLogical(mouseX, mouseY);
    if (!logicalPos) return;

    const { row, col } = logicalPos;
    const cell = this.boardModel.getCellAt(row, col);

    if (!cell || cell.value === -1 || !cell.hasChip()) return;

    this.draggedChip = {
      chipData: {
        hasChip: true,
        chipSelected: true,
        chipImage: cell.chip.imageSource,
      },
      fromRow: row,
      fromCol: col,
      currentX: mouseX,
      currentY: mouseY,
    };

    this.dragStartPos = { row, col };
    this.isDragging = true;

    // Marcar visualmente que está siendo arrastrada
    cell.chip.selected = true;

    this.redraw();
  }

  mouseMoveHandler(e) {
    e.preventDefault();
    if (!this.isDragging || !this.draggedChip) return;

    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Actualizar posición del drag
    this.draggedChip.currentX = mouseX;
    this.draggedChip.currentY = mouseY;

    // Cambiar cursor según dónde esté el mouse
    const logicalPos = this.boardView.screenToLogical(mouseX, mouseY);

    if (logicalPos && this.dragStartPos) {
      const isValidTarget = this.boardModel.isValidMove(
        this.dragStartPos.row,
        this.dragStartPos.col,
        logicalPos.row,
        logicalPos.col
      );

      this.canvas.style.cursor = isValidTarget ? "grabbing" : "not-allowed";
    } else {
      this.canvas.style.cursor = "grabbing";
    }

    this.redraw();
  }

  mouseUpHandler(e) {
    e.preventDefault();

    if (!this.isDragging || !this.draggedChip) return;

    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const logicalPos = this.boardView.screenToLogical(mouseX, mouseY);

    if (logicalPos) {
      const { row, col } = logicalPos;

      // Intentar hacer el movimiento
      if (
        this.boardModel.isValidMove(
          this.dragStartPos.row,
          this.dragStartPos.col,
          row,
          col
        )
      ) {
        this.boardModel.moveChip(
          this.dragStartPos.row,
          this.dragStartPos.col,
          row,
          col
        );

        this.checkGameOver();
      } else {
        // Deseleccionar si el movimiento fue inválido
        const startCell = this.boardModel.getCellAt(
          this.dragStartPos.row,
          this.dragStartPos.col
        );
        if (startCell && startCell.chip) {
          startCell.chip.selected = false;
        }
      }
    } else {
      // Deseleccionar si se soltó fuera
      const startCell = this.boardModel.getCellAt(
        this.dragStartPos.row,
        this.dragStartPos.col
      );
      if (startCell && startCell.chip) {
        startCell.chip.selected = false;
      }
    }

    // Limpiar estado del drag
    this.draggedChip = null;
    this.dragStartPos = null;
    this.isDragging = false;
    this.canvas.style.cursor = "default";

    this.redraw();
  }

  clickHandler(e) {
    e.preventDefault()

    if (!this.gameActive) return;

    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 1. Convertir coordenadas visuales a logicas
    const logicalPos = this.boardView.screenToLogical(mouseX, mouseY);

    if (!logicalPos) return;

    const { row, col } = logicalPos;

    // 2. Obtener celda del modelo
    const cell = this.boardModel.getCellAt(row, col);
    if (!cell || cell.value === -1) return;

    // 3. Logica de seleccion/movimiento
    if (cell.hasChip()) {
      this.selectChip(cell);
    } else if (this.selectedChip) {
      this.moveChip(this.selectedChip, cell.row, cell.col);
    }

    this.redraw();
  }

  selectChip(row, col) {
    // Deseleccionar todas
    this.boardModel.deselectAllChips();
    // Seleccionar la nueva
    const cell = this.boardModel.getCellAt(row, col);
    if (cell && cell.chip) {
      cell.chip.selected = true;
      this.selectedChip = { row, col };
    }
  }

  attemptMove(targetRow, targetCol) {
    if (!this.selectedChip) return;

    const { row: fromRow, col: fromCol } = this.selectedChip;

    if (this.boardModel.isValidMove(fromRow, fromCol, targetRow, targetCol)) {
      this.boardModel.moveChip(fromRow, fromCol, targetRow, targetCol);
      this.selectedChip = null;
      this.checkGameOver();
    } else {
      console.log("❌ Movimiento inválido");
    }
  }

  checkGameOver() {
    const remainingChips = this.boardModel.getRemainingChips();
    const hasValidMoves = this.boardModel.hasValidMoves();

    if (!hasValidMoves) {
      this.gameActive = false;

      if (remainingChips === 1) {
        setTimeout(() => {
          alert("¡FELICITACIONES! ¡Ganaste con solo 1 ficha!");
        }, 500);
      } else {
        setTimeout(() => {
          alert(`Juego terminado. Quedaron ${remainingChips} fichas.`);
        }, 500);
      }
    }
  }

  redraw() {
    this.clearCanvas();

    // 1. Obtener estado del MODELO
    const boardState = this.boardModel.getBoardState();

    // 2. Preparar info del drag (si existe)
    const dragInfo = this.draggedChip
      ? {
          chipData: this.draggedChip.chipData,
          fromRow: this.draggedChip.fromRow,
          fromCol: this.draggedChip.fromCol,
          currentX: this.draggedChip.currentX,
          currentY: this.draggedChip.currentY,
        }
      : null;

    // 3. Pasar datos a la VISTA
    this.boardView.draw(boardState, dragInfo);
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.handleMouseDown);
    this.canvas.removeEventListener("mousemove", this.handleMouseMove);
    this.canvas.removeEventListener("mouseup", this.handleMouseUp);
  }

  clearCanvas() {
    const ctx = this.boardView.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Limpiar completamente
    ctx.clearRect(0, 0, width, height);

    // Fondo con gradiente morado
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#100527");
    gradient.addColorStop(0.5, "#3a0477");
    gradient.addColorStop(1, "#100527");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
}
