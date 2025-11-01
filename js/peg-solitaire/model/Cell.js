// ========================================================================================
// CLASE CELL - Celda del tablero
// ========================================================================================

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
