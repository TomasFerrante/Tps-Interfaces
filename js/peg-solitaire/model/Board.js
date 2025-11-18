// ========================================================================================
// MODELO - Board.js
// SOLO lógica del juego (sin visuales ni conocimiento de la vista)
// Implementa el patrón MVC - esta es la capa de MODELO
// ========================================================================================

class Board {
  /**
   * Constructor del tablero
   * Inicializa la estructura del tablero y el estado del juego
   */
  constructor() {
    // Estructura del tablero (7x7)
    this.cells = []; // Matriz de celdas del tablero
    this.rows = 7; // Número de filas
    this.cols = 7; // Número de columnas
    this.chipImage = null; // Imagen de las fichas (se asigna después de la ruleta)

    // Estado del juego
    this.selectedCell = null; // Celda actualmente seleccionada {row, col}

    // Timer - Control de tiempo del juego
    this.startTime = null; // Timestamp del inicio del juego
    this.elapsedTime = 0; // Tiempo transcurrido en milisegundos
    this.maxTime = 10 * 60 * 1000; // Tiempo máximo: 10 minutos
    this.timerInterval = null; // Intervalo del timer

    this.initialize(); // Inicializar el tablero
  }

  /**
   * Inicializa el tablero con el patrón estándar de Peg Solitaire
   * Crea una matriz 7x7 con la forma característica del juego
   */
  initialize() {
    // Patrón del tablero de Peg Solitaire (forma de cruz)
    // -1: espacio inválido (fuera del área de juego)
    //  0: espacio vacío (solo el centro al inicio)
    //  1: ficha presente
    const initialBoard = [
      [-1, -1, 1, 1, 1, -1, -1], // Fila 0
      [-1, -1, 1, 1, 1, -1, -1], // Fila 1
      [1, 1, 1, 1, 1, 1, 1],     // Fila 2
      [1, 1, 1, 0, 1, 1, 1],     // Fila 3 (centro vacío)
      [1, 1, 1, 1, 1, 1, 1],     // Fila 4
      [-1, -1, 1, 1, 1, -1, -1], // Fila 5
      [-1, -1, 1, 1, 1, -1, -1], // Fila 6
    ];

    // Crear objetos Cell para cada posición del tablero
    for (let row = 0; row < initialBoard.length; row++) {
      this.cells[row] = [];
      for (let col = 0; col < initialBoard[row].length; col++) {
        this.cells[row][col] = new Cell(
          initialBoard[row][col], // Estado inicial
          row,                     // Posición fila
          col,                     // Posición columna
          this.chipImage          // Imagen de la ficha
        );
      }
    }
  }

  /**
   * Obtiene la celda en una posición específica
   * @param {number} row - Fila de la celda
   * @param {number} col - Columna de la celda
   * @returns {Cell|null} La celda o null si está fuera de los límites
   */
  getCellAt(row, col) {
    // Verificar que la posición esté dentro de los límites
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      return null;
    }
    return this.cells[row]?.[col];
  }

  // ========================================================================================
  // LÓGICA DE SELECCIÓN Y MOVIMIENTO
  // ========================================================================================

  /**
   * Selecciona una celda con ficha
   * @param {number} row - Fila de la celda a seleccionar
   * @param {number} col - Columna de la celda a seleccionar
   * @returns {boolean} True si la selección fue exitosa
   */
  selectCell(row, col) {
    const cell = this.getCellAt(row, col);
    // Verificar que la celda existe y tiene una ficha
    if (!cell || !cell.hasChip()) return false;

    // Deseleccionar todas las fichas antes de seleccionar una nueva
    this.deselectAllChips();

    // Seleccionar la nueva ficha
    if (cell.chip) {
      cell.chip.selected = true;
      this.selectedCell = { row, col }; // Guardar referencia a la celda seleccionada
    }

    return true;
  }

  /**
   * Deselecciona todas las fichas del tablero
   * Recorre todas las celdas y marca las fichas como no seleccionadas
   */
  deselectAllChips() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const cell = this.getCellAt(row, col);
        if (cell && cell.chip) {
          cell.chip.selected = false; // Marcar como no seleccionada
        }
      }
    }
    this.selectedCell = null; // Limpiar referencia de selección
  }

  /**
   * Verifica si un movimiento es válido según las reglas de Peg Solitaire
   * Reglas: Debe saltar sobre una ficha adyacente a un espacio vacío (2 espacios)
   * @param {number} fromRow - Fila origen
   * @param {number} fromCol - Columna origen
   * @param {number} toRow - Fila destino
   * @param {number} toCol - Columna destino
   * @returns {boolean} True si el movimiento es válido
   */
  isValidMove(fromRow, fromCol, toRow, toCol) {
    const fromCell = this.getCellAt(fromRow, fromCol);
    const toCell = this.getCellAt(toRow, toCol);

    // Verificaciones básicas
    if (!fromCell || !toCell) return false; // Celdas deben existir
    if (!fromCell.hasChip()) return false; // Celda origen debe tener ficha
    if (toCell.hasChip() || toCell.value === -1) return false; // Destino debe estar vacío y ser válido

    const rowDiff = toRow - fromRow; // Diferencia de filas
    const colDiff = toCol - fromCol; // Diferencia de columnas

    // Solo movimientos horizontales o verticales de 2 espacios
    if (Math.abs(rowDiff) === 2 && colDiff === 0) {
      // Movimiento vertical
      const middleRow = fromRow + rowDiff / 2; // Fila intermedia
      const middleCell = this.getCellAt(middleRow, fromCol);
      return middleCell && middleCell.hasChip(); // Debe haber ficha en el medio
    } else if (Math.abs(colDiff) === 2 && rowDiff === 0) {
      // Movimiento horizontal
      const middleCol = fromCol + colDiff / 2; // Columna intermedia
      const middleCell = this.getCellAt(fromRow, middleCol);
      return middleCell && middleCell.hasChip(); // Debe haber ficha en el medio
    }

    return false; // No es un movimiento válido
  }

  /**
   * Ejecuta un movimiento de ficha en el tablero
   * Mueve la ficha, elimina la ficha saltada y deselecciona todo
   * @param {number} fromRow - Fila origen
   * @param {number} fromCol - Columna origen
   * @param {number} toRow - Fila destino
   * @param {number} toCol - Columna destino
   * @returns {boolean} True si el movimiento fue exitoso
   */
  moveChip(fromRow, fromCol, toRow, toCol) {
    // Verificar que el movimiento sea válido
    if (!this.isValidMove(fromRow, fromCol, toRow, toCol)) {
      return false;
    }

    const fromCell = this.getCellAt(fromRow, fromCol);
    const toCell = this.getCellAt(toRow, toCol);

    // Calcular celda del medio (la que será eliminada)
    const middleRow = fromRow + (toRow - fromRow) / 2;
    const middleCol = fromCol + (toCol - fromCol) / 2;
    const middleCell = this.getCellAt(middleRow, middleCol);

    // Ejecutar el movimiento
    toCell.addChip(this.chipImage); // Agregar ficha al destino
    fromCell.removeChip(); // Remover ficha del origen
    middleCell.removeChip(); // Remover ficha saltada

    // Deseleccionar todas las fichas
    this.deselectAllChips();

    return true;
  }

  /**
   * Obtiene todos los movimientos válidos desde una posición específica
   * @param {number} row - Fila de origen
   * @param {number} col - Columna de origen
   * @returns {Array} Array de objetos {row, col} con las posiciones válidas
   */
  getValidMovesFrom(row, col) {
    const validMoves = [];
    
    const directions = [
      [2, 0],   // Abajo
      [-2, 0],  // Arriba
      [0, 2],   // Derecha
      [0, -2],  // Izquierda
    ];

    // Probar cada dirección
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

  /**
   * Verifica si existen movimientos válidos en el tablero
   * Recorre todas las fichas y verifica si alguna puede moverse
   * @returns {boolean} True si hay al menos un movimiento válido
   */
  hasValidMoves() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const cell = this.getCellAt(row, col);
        if (cell && cell.hasChip()) {
          // Direcciones posibles
          const directions = [
            [2, 0],   // Abajo
            [-2, 0],  // Arriba
            [0, 2],   // Derecha
            [0, -2],  // Izquierda
          ];
          // Si alguna dirección es válida, hay movimientos disponibles
          for (const [dRow, dCol] of directions) {
            if (this.isValidMove(row, col, row + dRow, col + dCol)) {
              return true;
            }
          }
        }
      }
    }
    return false; // No hay movimientos válidos (game over)
  }

  /**
   * Cuenta el número de fichas restantes en el tablero
   * @returns {number} Cantidad de fichas en el tablero
   */
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

  /**
   * Verifica si el jugador ganó el juego
   * Condición de victoria: Solo 1 ficha restante en el centro del tablero
   * @returns {boolean} True si el jugador ganó
   */
  checkWin() {
    const remaining = this.getRemainingChips();
    const centerCell = this.getCellAt(3, 3); // Celda central (fila 3, columna 3)
    // Victoria: 1 ficha y está en el centro
    return remaining === 1 && centerCell && centerCell.hasChip();
  }

  /**
   * Actualiza la imagen de todas las fichas en el tablero
   * Se usa después de girar la ruleta para aplicar el campeón seleccionado
   * @param {Image} chipImage - Nueva imagen para las fichas
   */
  setChipImage(chipImage) {
    this.chipImage = chipImage;
    // Actualizar la imagen en todas las celdas
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.cells[row][col].setChipImage(chipImage);
      }
    }
  }

  // ========================================================================================
  // LÓGICA DEL TIMER (sin renderizado)
  // El modelo maneja el tiempo, la vista solo lo muestra
  // ========================================================================================

  /**
   * Inicia el temporizador del juego
   * El timer cuenta hacia atrás desde maxTime (10 minutos)
   */
  startTimer() {
    this.startTime = Date.now(); // Guardar timestamp de inicio
    this.elapsedTime = 0; // Resetear tiempo transcurrido

    // Limpiar intervalo anterior si existe
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    // Actualizar el tiempo transcurrido cada 100ms
    this.timerInterval = setInterval(() => {
      this.elapsedTime = Date.now() - this.startTime;
    }, 100);
  }

  /**
   * Detiene el temporizador del juego
   * Se usa al terminar o pausar el juego
   */
  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /**
   * Calcula el tiempo restante en milisegundos
   * @returns {number} Tiempo restante (no puede ser negativo)
   */
  getRemainingTime() {
    return Math.max(0, this.maxTime - this.elapsedTime);
  }

  /**
   * Verifica si el tiempo se agotó
   * @returns {boolean} True si el tiempo llegó a 0
   */
  isTimeUp() {
    return this.getRemainingTime() <= 0;
  }

  /**
   * Formatea el tiempo restante en formato MM:SS
   * @returns {string} Tiempo formateado (ej: "09:45")
   */
  getFormattedTime() {
    const remainingTime = this.getRemainingTime();
    const seconds = Math.floor(remainingTime / 1000); // Convertir a segundos
    const minutes = Math.floor(seconds / 60); // Calcular minutos
    const remainingSeconds = seconds % 60; // Segundos restantes después de los minutos
    // Formatear con ceros a la izquierda (ej: "09:05")
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  }

  /**
   * Obtiene datos del timer formateados para la vista
   * Incluye color según el tiempo restante (verde/amarillo/rojo)
   * @returns {Object} {formattedTime, color, isLow}
   */
  getTimerData() {
    const remainingTime = this.getRemainingTime();
    let color = "#03ad56"; // Verde por defecto

    // Cambiar color según tiempo restante
    if (remainingTime <= 30000 && remainingTime > 10000) {
      color = "#f7b731"; // Amarillo (menos de 30 segundos)
    } else if (remainingTime <= 10000) {
      color = "#f25022"; // Rojo (menos de 10 segundos)
    }

    return {
      formattedTime: this.getFormattedTime(), // Tiempo en formato MM:SS
      color: color, // Color para mostrar en la vista
      isLow: remainingTime <= 30000, // Flag de tiempo bajo
    };
  }

  // ========================================================================================
  // REINICIAR JUEGO Y OBTENER ESTADO
  // ========================================================================================

  /**
   * Reinicia el tablero a su estado inicial
   * Limpia todo y vuelve a inicializar el juego
   */
  reset() {
    this.cells = []; // Limpiar celdas
    this.selectedCell = null; // Limpiar selección
    this.initialize(); // Reinicializar tablero
    this.stopTimer(); // Detener timer anterior
    this.startTimer(); // Iniciar nuevo timer
  }

  /**
   * Obtiene el estado completo del tablero en formato serializable
   * La vista usa este método para obtener los datos a renderizar
   * @returns {Object} Estado del tablero con información de todas las celdas
   */
  getBoardState() {
    const result = {
      cells: [],
    };

    // Recorrer todas las celdas y crear una representación simple
    for (let i = 0; i < this.cells.length; i++) {
      const row = [];
      for (let j = 0; j < this.cells[i].length; j++) {
        const cell = this.cells[i][j];
        row.push({
          value: cell.value, // Estado: -1, 0, 1
          row: cell.row, // Posición fila
          col: cell.col, // Posición columna
          hasChip: cell.hasChip(), // ¿Tiene ficha?
          chipSelected: cell.chip ? cell.chip.selected : false, // ¿Está seleccionada?
          chipImage: cell.chip ? cell.chip.imageSource : null, // Imagen de la ficha
        });
      }
      result.cells.push(row);
    }

    return result;
  }
}
