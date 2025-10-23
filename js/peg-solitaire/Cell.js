// ========================================================================================
// CLASE CELL - Celda del tablero
// ========================================================================================

class Cell {
    constructor(value, x, y, size, ctx) {
        this.value = value;
        this.x = x;
        this.y = y;
        this.size = size;
        this.ctx = ctx;
        this.ficha = value === 1 ? new Chip(x, y, size, this.ctx) : null;
    }

    draw(pattern) {
        if (this.value !== -1) {
            // Dibujar fondo de la celda
            this.ctx.fillStyle = pattern || '#C0C0C0';
            this.ctx.fillRect(this.x, this.y, this.size, this.size);

            // Dibujar borde de la celda
            this.ctx.strokeStyle = '#000';
            this.ctx.strokeRect(this.x, this.y, this.size, this.size);

            // Dibujar el espacio para la ficha (círculo)
            this.ctx.beginPath();
            this.ctx.arc(
                this.x + this.size / 2,
                this.y + this.size / 2,
                this.size / 3,
                0,
                Math.PI * 2
            );

            // Color según el estado de la celda
            if (this.ficha) {
                // Ficha presente
                this.ctx.fillStyle = this.ficha.selected ? '#eaeaeac0' : '#cdd1d4ea';
            } else {
                // Espacio vacío
                this.ctx.fillStyle = '#d5d3d369';
            }
            this.ctx.fill();
        }
    }
}
