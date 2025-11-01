// ========================================================================================
// MODELO - Board.js
// SOLO lógica del juego (sin visuales ni conocimiento de la vista)
// ========================================================================================

class Board {
  constructor() {
    // Estructura del tablero (7x7)
    this.cells = [];
    this.rows = 7;
    this.cols = 7;
    this.chipImage = null;

    // Estado del juego
    this.selectedCell = null;

    // Timer
    this.startTime = null;
    this.elapsedTime = 0;
    this.maxTime = 10 * 60 * 1000; // 10 minutos
    this.timerInterval = null;

    this.initialize();
  }

  initialize() {
    // Patrón del tablero de Peg Solitaire
    // -1: espacio inválido
    //  0: espacio vacío (centro)
    //  1: ficha presente
    const initialBoard = [
      [-1, -1, 1, 1, 1, -1, -1],
      [-1, -1, 1, 1, 1, -1, -1],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 0, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [-1, -1, 1, 1, 1, -1, -1],
      [-1, -1, 1, 1, 1, -1, -1],
    ];

    for (let row = 0; row < initialBoard.length; row++) {
      this.cells[row] = [];
      for (let col = 0; col < initialBoard[row].length; col++) {
        this.cells[row][col] = new Cell(
          initialBoard[row][col],
          row,
          col,
          this.chipImage
        );
      }
    }
  }

  getCellAt(row, col) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      return null;
    }
    return this.cells[row]?.[col];
  }

  // ========================================================================================
  // LÓGICA DE SELECCIÓN Y MOVIMIENTO
  // ========================================================================================

  selectCell(row, col) {
    const cell = this.getCellAt(row, col);
    if (!cell || !cell.hasChip()) return false;

    // Deseleccionar todas las fichas
    this.deselectAllChips();

    // Seleccionar la nueva ficha
    if (cell.chip) {
      cell.chip.selected = true;
      this.selectedCell = { row, col };
    }

    return true;
  }

  deselectAllChips() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const cell = this.getCellAt(row, col);
        if (cell && cell.chip) {
          cell.chip.selected = false;
        }
      }
    }
    this.selectedCell = null;
  }

  isValidMove(fromRow, fromCol, toRow, toCol) {
    const fromCell = this.getCellAt(fromRow, fromCol);
    const toCell = this.getCellAt(toRow, toCol);

    if (!fromCell || !toCell) return false;
    if (!fromCell.hasChip()) return false;
    if (toCell.hasChip() || toCell.value === -1) return false;

    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;

    // Solo movimientos horizontales o verticales de 2 espacios
    if (Math.abs(rowDiff) === 2 && colDiff === 0) {
      const middleRow = fromRow + rowDiff / 2;
      const middleCell = this.getCellAt(middleRow, fromCol);
      return middleCell && middleCell.hasChip();
    } else if (Math.abs(colDiff) === 2 && rowDiff === 0) {
      const middleCol = fromCol + colDiff / 2;
      const middleCell = this.getCellAt(fromRow, middleCol);
      return middleCell && middleCell.hasChip();
    }

    return false;
  }

  moveChip(fromRow, fromCol, toRow, toCol) {
    if (!this.isValidMove(fromRow, fromCol, toRow, toCol)) {
      return false;
    }

    const fromCell = this.getCellAt(fromRow, fromCol);
    const toCell = this.getCellAt(toRow, toCol);

    // Calcular celda del medio
    const middleRow = fromRow + (toRow - fromRow) / 2;
    const middleCol = fromCol + (toCol - fromCol) / 2;
    const middleCell = this.getCellAt(middleRow, middleCol);

    // Mover la ficha
    toCell.addChip(this.chipImage);
    fromCell.removeChip();
    middleCell.removeChip();

    // Deseleccionar
    this.deselectAllChips();

    return true;
  }

  getValidMovesFrom(row, col) {
    const validMoves = [];
    const directions = [
      [2, 0],
      [-2, 0],
      [0, 2],
      [0, -2],
    ];

    for (const [dRow, dCol] of directions) {
      const newRow = row + dRow;
      const newCol = col + dCol;
      if (this.isValidMove(row, col, newRow, newCol)) {
        validMoves.push({ row: newRow, col: newCol });
      }
    }

    return validMoves;
  }

  // ========================================================================================
  // LÓGICA DE ESTADO DEL JUEGO
  // ========================================================================================

  hasValidMoves() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const cell = this.getCellAt(row, col);
        if (cell && cell.hasChip()) {
          const directions = [
            [2, 0],
            [-2, 0],
            [0, 2],
            [0, -2],
          ];
          for (const [dRow, dCol] of directions) {
            if (this.isValidMove(row, col, row + dRow, col + dCol)) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  getRemainingChips() {
    let count = 0;
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const cell = this.getCellAt(row, col);
        if (cell && cell.hasChip()) {
          count++;
        }
      }
    }
    return count;
  }

  checkWin() {
    const remaining = this.getRemainingChips();
    const centerCell = this.getCellAt(3, 3);
    return remaining === 1 && centerCell && centerCell.hasChip();
  }

  setChipImage(chipImage) {
    this.chipImage = chipImage;
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.cells[row][col].setChipImage(chipImage);
      }
    }
  }

  // ========================================================================================
  // LÓGICA DEL TIMER (sin renderizado)
  // ========================================================================================

  startTimer() {
    this.startTime = Date.now();
    this.elapsedTime = 0;

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerInterval = setInterval(() => {
      this.elapsedTime = Date.now() - this.startTime;
    }, 100);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  getRemainingTime() {
    return Math.max(0, this.maxTime - this.elapsedTime);
  }

  isTimeUp() {
    return this.getRemainingTime() <= 0;
  }

  getFormattedTime() {
    const remainingTime = this.getRemainingTime();
    const seconds = Math.floor(remainingTime / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  }

  // Método para obtener información del timer para la vista
  getTimerData() {
    const remainingTime = this.getRemainingTime();
    let color = "#03ad56"; // Verde por defecto

    if (remainingTime <= 30000 && remainingTime > 10000) {
      color = "#f7b731"; // Amarillo
    } else if (remainingTime <= 10000) {
      color = "#f25022"; // Rojo
    }

    return {
      formattedTime: this.getFormattedTime(),
      color: color,
      isLow: remainingTime <= 30000,
    };
  }

  // ========================================================================================
  // REINICIAR JUEGO
  // ========================================================================================

  reset() {
    this.cells = [];
    this.selectedCell = null;
    this.initialize();
    this.stopTimer();
    this.startTimer();
  }

  getBoardState() {
    const result = {
      cells: [],
    };

    for (let i = 0; i < this.cells.length; i++) {
      const row = [];
      for (let j = 0; j < this.cells[i].length; j++) {
        const cell = this.cells[i][j];
        row.push({
          value: cell.value,
          row: cell.row,
          col: cell.col,
          hasChip: cell.hasChip(),
          chipSelected: cell.chip ? cell.chip.selected : false,
          chipImage: cell.chip ? cell.chip.imageSource : null,
        });
      }
      result.cells.push(row);
    }

    return result;
  }
}
