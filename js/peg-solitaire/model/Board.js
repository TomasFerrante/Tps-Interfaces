// ========================================================================================
// CLASE BOARD - Tablero de Peg Solitaire
// ========================================================================================

class Board {
    constructor(fila, columna, width, height) {
        this.fila = fila;
        this.columna = columna;
        this.width = width;
        this.height = height;
        this.cells = [];
        this.cellSize = 40;
        this.pattern = null;
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
            [-1, -1, 1, 1, 1, -1, -1]
        ];

        for (let row = 0; row < initialBoard.length; row++) {
            this.cells[row] = [];
            for (let col = 0; col < initialBoard[row].length; col++) {
                const cellX = this.x + col * this.cellSize;
                const cellY = this.y + row * this.cellSize;
                this.cells[row][col] = new Cell(
                    initialBoard[row][col],
                    cellX,
                    cellY,
                    this.cellSize,
                    this.ctx
                );
            }
        }
    }
    
    isMoveValid(filaDes, columnaDes) {
        return this.cells[filaDes][columnaDes] === 0;
    }

    moveChip(chip, filaDes, columnaDes) {
        this.cells[filaDes][columnaDes] = chip;
    }

    hasChip(fila, col) {
        return this.cells[fila][col] === 1;
    }

    isValidCell(fila, col) {
        return this.cells[fila]?.[col] !== -1;
    }

    setColor(color) {
        this.pattern = color;
    }

    setChipImage(chipImage) {
        // Actualizar todas las celdas con la nueva imagen de ficha
        for (let row = 0; row < this.cells.length; row++) {
            for (let col = 0; col < this.cells[row].length; col++) {
                this.cells[row][col].setChipImage(chipImage);
            }
        }
    }
}
