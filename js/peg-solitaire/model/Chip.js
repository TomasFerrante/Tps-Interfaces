// ========================================================================================
// CLASE CHIP - Ficha del juego
// ========================================================================================

class Chip {
    constructor(x, y, size, radius, chipImage = null) {
        //this.x = x; Reemplazar por Columna
        //this.y = y; Reemplazar por Fila
        this.size = size;
        this.selected = false;
        this.radius = radius || size / 3;
        this.fichas = [];
        this.chipImage = chipImage;
    }

    moveTo() {

    }

    isClicked(mouseX, mouseY) {
        const centerX = this.x + this.size / 2;
        const centerY = this.y + this.size / 2;
        const distance = Math.sqrt(
            Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2)
        );
        return distance <= this.size / 3;
    }
    
    findClickedFicha(x, y) {
        for (let i = 0; i < this.fichas.length; i++) {
            const ficha = this.fichas[i];
            if (ficha.isPointInside(x, y)) {
                return ficha;
            }
        }
        return null;
    }

    isPointInside(px, py) {
        const _x = this.x - px;
        const _y = this.y - py;
        return Math.sqrt(_x * _x + _y * _y) <= this.radius;
    }

    addChip(ficha) {
        this.fichas.push(ficha);
    }
}
