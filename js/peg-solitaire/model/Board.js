// ========================================================================================
// CLASE BOARD - Tablero de Peg Solitaire
// ========================================================================================

class Board {
  constructor() {
    this.cells = [];
    this.rows = 7;
    this.cols = 7;
    this.chipImage = null;
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

  isValidMove(fromRow, fromCol, toRow, toCol) {
    // Verificar que las posiciones sean válidas
    const fromCell = this.getCellAt(fromRow, fromCol);
    const toCell = this.getCellAt(toRow, toCol);

    if (!fromCell || !toCell) return false;
    if (!fromCell.hasChip()) return false;
    if (toCell.hasChip() || toCell.value === -1) return false;

    // Calcular la diferencia
    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;

    // Solo movimientos horizontales o verticales de 2 espacios
    if (Math.abs(rowDiff) === 2 && colDiff === 0) {
      // Movimiento vertical
      const middleRow = fromRow + rowDiff / 2;
      const middleCell = this.getCellAt(middleRow, fromCol);
      return middleCell && middleCell.hasChip();
    } else if (Math.abs(colDiff) === 2 && rowDiff === 0) {
      // Movimiento horizontal
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

    return true;
  }

  hasValidMoves() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const cell = this.getCellAt(row, col);
        if (cell && cell.hasChip()) {
          // Verificar las 4 direcciones posibles
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

  setChipImage(chipImage) {
    this.chipImage = chipImage;
    // Actualizar todas las celdas con la nueva imagen de ficha
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.cells[row][col].setChipImage(chipImage);
      }
    }
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

  deselectAllChips() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const cell = this.getCellAt(row, col);
        if (cell && cell.chip) {
          cell.chip.selected = false;
        }
      }
    }
  }
}

class Cell {
  constructor(value, row, col, chipImage) {
    this.value = value;
    this.row = row;
    this.col = col;
    this.chipImage = chipImage;
    this.chip =
      value === 1 ? { selected: false, imageSource: chipImage } : null;
  }

  hasChip() {
    return this.value === 1;
  }

  addChip(chipImage) {
    this.value = 1;
    this.chip = { selected: false, imageSource: chipImage };
  }

  removeChip() {
    this.value = 0;
    this.chip = null;
  }

  setChipImage(chipImage) {
    if (this.chip) {
      this.chip.imageSource = chipImage;
    }
  }
}
