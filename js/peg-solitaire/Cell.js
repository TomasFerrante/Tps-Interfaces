// ========================================================================================
// CLASE CELL - Celda del tablero
// ========================================================================================

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

    draw(pattern) {
        if (this.value !== -1) {
            // Dibujar fondo de la celda con patrón o color
            this.ctx.fillStyle = pattern || '#2a1a4a';
            this.ctx.fillRect(this.x, this.y, this.size, this.size);

            // Efecto de bisel en la celda
            this.drawCellBevel();

            // Dibujar el espacio para la ficha (círculo con efecto 3D)
            this.drawChipSocket();

            // Si hay ficha, dibujarla con efectos
            if (this.ficha) {
                this.ficha.draw();
            }
        }
    }

    drawCellBevel() {
        // Sombra interna superior izquierda (oscura)
        const darkGradient = this.ctx.createLinearGradient(
            this.x,
            this.y,
            this.x + this.size / 4,
            this.y + this.size / 4
        );
        darkGradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
        darkGradient.addColorStop(1, 'transparent');
        this.ctx.fillStyle = darkGradient;
        this.ctx.fillRect(this.x, this.y, this.size / 4, this.size / 4);

        // Brillo inferior derecha (claro)
        const lightGradient = this.ctx.createLinearGradient(
            this.x + this.size,
            this.y + this.size,
            this.x + (this.size * 3) / 4,
            this.y + (this.size * 3) / 4
        );
        lightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
        lightGradient.addColorStop(1, 'transparent');
        this.ctx.fillStyle = lightGradient;
        this.ctx.fillRect(
            this.x + (this.size * 3) / 4,
            this.y + (this.size * 3) / 4,
            this.size / 4,
            this.size / 4
        );

        // Borde de la celda con gradiente sutil
        const borderGradient = this.ctx.createLinearGradient(
            this.x,
            this.y,
            this.x,
            this.y + this.size
        );
        borderGradient.addColorStop(0, 'rgba(138, 56, 245, 0.3)');
        borderGradient.addColorStop(0.5, 'rgba(138, 56, 245, 0.1)');
        borderGradient.addColorStop(1, 'rgba(138, 56, 245, 0.3)');
        this.ctx.strokeStyle = borderGradient;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(this.x, this.y, this.size, this.size);
    }

    drawChipSocket() {
        const centerX = this.x + this.size / 2;
        const centerY = this.y + this.size / 2;
        const radius = this.size / 3;

        // Sombra del agujero (efecto hundido)
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.fill();

        // Gradiente radial para dar profundidad
        const socketGradient = this.ctx.createRadialGradient(
            centerX - radius / 3,
            centerY - radius / 3,
            0,
            centerX,
            centerY,
            radius
        );

        if (this.ficha) {
            // Si hay ficha, fondo más claro
            socketGradient.addColorStop(0, 'rgba(138, 56, 245, 0.2)');
            socketGradient.addColorStop(0.7, 'rgba(86, 3, 173, 0.3)');
            socketGradient.addColorStop(1, 'rgba(16, 5, 39, 0.5)');
        } else {
            // Si está vacío, más oscuro
            socketGradient.addColorStop(0, 'rgba(16, 5, 39, 0.8)');
            socketGradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.6)');
            socketGradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
        }

        this.ctx.fillStyle = socketGradient;
        this.ctx.fill();

        // Borde del agujero con brillo sutil
        this.ctx.strokeStyle = this.ficha
            ? 'rgba(247, 183, 49, 0.3)'
            : 'rgba(138, 56, 245, 0.2)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.restore();
    }
}
