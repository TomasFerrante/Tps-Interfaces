class PegController {
  constructor(
    boardModel,
    boardView,
    chipModel,
    chipView,
    cellModel,
    cellView,
    draggedChip,
    canvas
  ) {
    this.boardModel = boardModel;
    this.boardView = boardView;
    this.chipModel = chipModel;
    this.chipView = chipView;
    this.cellModel = cellModel;
    this.cellView = cellView;
    this.draggedChip = draggedChip;
    this.canvas = canvas;
    this.gameActive = true;
  }

  init() {
    this.setUpEventListeners();
  }

  // Maneja eventos mouse
  setUpEventListeners() {
    this.clickHandler = (e) => this.handleClick(e);
    this.mouseMoveHandler = (e) => this.onMouseMove(e);

    this.canvas.addEventListener("click", this.clickHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }

  handleClick(e) {
    if (!this.gameActive) return;

    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 1. Convertir coordenadas visualas a logicas
    const logicalPos = this.boardView.screenToLogical(mouseX, mouseY);

    if (!logicalPos) {
      return;
    }

    const { row, col } = logicalPos;

    // 2. Obtener celda del modelo
    const cell = this.boardModel.getCellAt(row, col);
    if (!cell || cell.value === -1) {
      return; // Celda invalida
    }

    // 3. Logica de seleccion/movimiento
    if (cell.hasChip()) {
      this.selectChip(cell);
    } else if (this.selectedChip) {
      this.moveChip(this.selectedChip, cell.row, cell.col);
    }

    this.boardView.reDraw();
  }

  // Logica drag and drop
  onMouseMove(e) {
    if (this.draggedChip) {
      const rect = this.pegView.canvas.getBoundingClientRect();
      this.draggedChip.x = e.clientX - rect.left;
      this.draggedChip.y = e.clientY - rect.top;
      this.reDraw();
    }
  }
}
