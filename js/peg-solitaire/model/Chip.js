// ========================================================================================
// CLASE CHIP - Ficha del juego
// NOTA: Esta clase está en desuso y ha sido reemplazada por la lógica en Cell.js
// Se mantiene por compatibilidad pero no se utiliza activamente en el juego
// ========================================================================================

class Chip {
    /**
     * Constructor de la ficha
     * @param {number} x - Posición X en el canvas (deprecado, usar columna)
     * @param {number} y - Posición Y en el canvas (deprecado, usar fila)
     * @param {number} size - Tamaño de la ficha
     * @param {number} radius - Radio de la ficha
     * @param {Image} chipImage - Imagen de la ficha
     */
    constructor(x, y, size, radius, chipImage = null) {
        //this.x = x; // TODO: Reemplazar por Columna
        //this.y = y; // TODO: Reemplazar por Fila
        this.size = size; // Tamaño de la ficha
        this.selected = false; // Estado de selección
        this.dragged = false; // Estado de arrastre
        this.radius = radius || size / 3; // Radio para detección de clicks
        this.fichas = []; // Array de fichas (uso no definido)
        this.chipImage = chipImage; // Imagen de la ficha
    }

    /**
     * Método para mover la ficha (no implementado)
     */
    moveTo() {
        // Sin implementación
    }

    /**
     * Verifica si el mouse hizo click dentro de la ficha
     * @param {number} mouseX - Posición X del mouse
     * @param {number} mouseY - Posición Y del mouse
     * @returns {boolean} True si el click está dentro de la ficha
     */
    isClicked(mouseX, mouseY) {
        const centerX = this.x + this.size / 2; // Centro X de la ficha
        const centerY = this.y + this.size / 2; // Centro Y de la ficha
        // Calcular distancia del mouse al centro
        const distance = Math.sqrt(
            Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2)
        );
        // Verificar si está dentro del radio
        return distance <= this.size / 3;
    }

    /**
     * Busca una ficha que haya sido clickeada en la lista de fichas
     * @param {number} x - Posición X del click
     * @param {number} y - Posición Y del click
     * @returns {Chip|null} La ficha clickeada o null si no se encontró ninguna
     */
    findClickedFicha(x, y) {
        for (let i = 0; i < this.fichas.length; i++) {
            const ficha = this.fichas[i];
            if (ficha.isPointInside(x, y)) {
                return ficha;
            }
        }
        return null;
    }

    /**
     * Verifica si un punto está dentro del área de la ficha
     * @param {number} px - Posición X del punto
     * @param {number} py - Posición Y del punto
     * @returns {boolean} True si el punto está dentro del radio de la ficha
     */
    isPointInside(px, py) {
        const _x = this.x - px; // Diferencia en X
        const _y = this.y - py; // Diferencia en Y
        // Calcular distancia y comparar con el radio
        return Math.sqrt(_x * _x + _y * _y) <= this.radius;
    }

    /**
     * Agrega una ficha al array de fichas
     * @param {Chip} ficha - Ficha a agregar
     */
    addChip(ficha) {
        this.fichas.push(ficha);
    }
}
