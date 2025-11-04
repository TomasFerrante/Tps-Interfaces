// ========================================================================================
// CLASE CELL - Celda del tablero
// Representa una celda individual del tablero de Peg Solitaire
// ========================================================================================

class Cell {
  /**
   * Constructor de la celda
   * @param {number} value - Estado de la celda: -1 (inválida), 0 (vacía), 1 (con ficha)
   * @param {number} row - Fila donde se encuentra la celda
   * @param {number} col - Columna donde se encuentra la celda
   * @param {Image} chipImage - Imagen de la ficha (si tiene una)
   */
  constructor(value, row, col, chipImage) {
    this.value = value; // Estado: -1=inválida, 0=vacía, 1=con ficha
    this.row = row; // Posición en fila
    this.col = col; // Posición en columna
    this.chipImage = chipImage; // Imagen de la ficha
    // Si la celda tiene ficha (value=1), crear objeto chip con estado de selección
    this.chip =
      value === 1 ? { selected: false, imageSource: chipImage } : null;
  }

  /**
   * Verifica si la celda tiene una ficha
   * @returns {boolean} True si la celda tiene ficha (value === 1)
   */
  hasChip() {
    return this.value === 1;
  }

  /**
   * Agrega una ficha a la celda
   * @param {Image} chipImage - Imagen de la ficha a agregar
   */
  addChip(chipImage) {
    this.value = 1; // Marcar celda como ocupada
    this.chip = { selected: false, imageSource: chipImage }; // Crear objeto chip
  }

  /**
   * Remueve la ficha de la celda
   */
  removeChip() {
    this.value = 0; // Marcar celda como vacía
    this.chip = null; // Eliminar objeto chip
  }

  /**
   * Actualiza la imagen de la ficha en la celda
   * @param {Image} chipImage - Nueva imagen para la ficha
   */
  setChipImage(chipImage) {
    if (this.chip) {
      this.chip.imageSource = chipImage;
    }
  }
}
