// ========================================================================================
// CLASE CELL - Celda del tablero
// ========================================================================================


// Puede que no exista esta clase!!

class Cell {
    constructor(value, x, y, size, ctx, chipImage = null) {
        this.value = value;
        this.x = x;
        this.y = y;
        this.size = size;
        this.ctx = ctx;
        this.chipImage = chipImage;
        this.ficha = value === 1 ? new Chip(x, y, size, this.ctx, size / 3, this.chipImage) : null;
    }

    setChipImage(chipImage) {
        this.chipImage = chipImage;
        if (this.ficha) {
            this.ficha.chipImage = chipImage;
        }
    }
}
