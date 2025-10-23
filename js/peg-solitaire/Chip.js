// ========================================================================================
// CLASE CHIP - Ficha del juego
// ========================================================================================

class Chip {
    constructor(x, y, size, ctx, radius, chipImage = null) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.selected = false;
        this.ctx = ctx;
        this.radius = radius || size / 3;
        this.fichas = [];
        this.chipImage = chipImage;
    }

    draw() {
        const centerX = this.x + this.size / 2;
        const centerY = this.y + this.size / 2;
        const radius = this.size / 3;

        this.ctx.save();

        // Si hay imagen de ficha personalizada, dibujarla
        if (this.chipImage) {
            this.drawCustomChip(centerX, centerY, radius);
            this.ctx.restore();
            return;
        }

        // Sombra de la ficha
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        this.ctx.shadowBlur = 8;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 4;

        // Gradiente radial para efecto 3D
        const chipGradient = this.ctx.createRadialGradient(
            centerX - radius / 3,
            centerY - radius / 3,
            0,
            centerX,
            centerY,
            radius
        );

        if (this.selected) {
            // Ficha seleccionada - dorada brillante
            chipGradient.addColorStop(0, '#ffd32a');
            chipGradient.addColorStop(0.3, '#f7b731');
            chipGradient.addColorStop(0.7, '#e08e00');
            chipGradient.addColorStop(1, '#b87100');
        } else {
            // Ficha normal - plateada con tonos morados
            chipGradient.addColorStop(0, '#e8e8e8');
            chipGradient.addColorStop(0.3, '#c5c5c5');
            chipGradient.addColorStop(0.7, '#8a8a8a');
            chipGradient.addColorStop(1, '#5a5a5a');
        }

        // Dibujar la ficha principal
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = chipGradient;
        this.ctx.fill();

        // Borde de la ficha con brillo
        const borderGradient = this.ctx.createLinearGradient(
            centerX,
            centerY - radius,
            centerX,
            centerY + radius
        );

        if (this.selected) {
            borderGradient.addColorStop(0, '#fff4d6');
            borderGradient.addColorStop(0.5, '#f7b731');
            borderGradient.addColorStop(1, '#8a6000');
        } else {
            borderGradient.addColorStop(0, '#ffffff');
            borderGradient.addColorStop(0.5, '#a0a0a0');
            borderGradient.addColorStop(1, '#404040');
        }

        this.ctx.strokeStyle = borderGradient;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Brillo superior (highlight)
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;

        const highlightGradient = this.ctx.createRadialGradient(
            centerX - radius / 4,
            centerY - radius / 4,
            0,
            centerX - radius / 4,
            centerY - radius / 4,
            radius / 2
        );
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        highlightGradient.addColorStop(1, 'transparent');

        this.ctx.beginPath();
        this.ctx.arc(centerX - radius / 4, centerY - radius / 4, radius / 2, 0, Math.PI * 2);
        this.ctx.fillStyle = highlightGradient;
        this.ctx.fill();

        // Diseño decorativo en el centro (opcional)
        if (this.selected) {
            this.drawChipDecoration(centerX, centerY, radius);
        }

        this.ctx.restore();
    }

    drawChipDecoration(centerX, centerY, radius) {
        // Estrella pequeña en el centro de la ficha seleccionada
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.shadowColor = '#ffd32a';
        this.ctx.shadowBlur = 10;

        const starRadius = radius / 4;
        const points = 5;

        this.ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points - Math.PI / 2;
            const r = i % 2 === 0 ? starRadius : starRadius / 2;
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.restore();
    }

    drawCustomChip(centerX, centerY, radius) {
        // Sombra de la ficha
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        this.ctx.shadowBlur = 8;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 4;

        // Dibujar círculo de fondo si está seleccionada
        if (this.selected) {
            const bgGradient = this.ctx.createRadialGradient(
                centerX - radius / 3,
                centerY - radius / 3,
                0,
                centerX,
                centerY,
                radius * 1.2
            );
            bgGradient.addColorStop(0, '#ffd32a');
            bgGradient.addColorStop(0.5, '#f7b731');
            bgGradient.addColorStop(1, '#e08e00');

            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius * 1.15, 0, Math.PI * 2);
            this.ctx.fillStyle = bgGradient;
            this.ctx.fill();
        }

        // Dibujar la imagen de la ficha
        this.ctx.shadowColor = 'transparent';
        const imgSize = radius * 2;
        this.ctx.drawImage(
            this.chipImage,
            centerX - imgSize / 2,
            centerY - imgSize / 2,
            imgSize,
            imgSize
        );

        // Borde brillante si está seleccionada
        if (this.selected) {
            this.ctx.strokeStyle = '#fff4d6';
            this.ctx.lineWidth = 3;
            this.ctx.shadowColor = '#ffd32a';
            this.ctx.shadowBlur = 10;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius * 1.05, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }

    isClicked(mouseX, mouseY) {
        const centerX = this.x + this.size / 2;
        const centerY = this.y + this.size / 2;
        const distance = Math.sqrt(
            Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2)
        );
        return distance <= this.size / 3;
    }

    setUpEventListeners() {
        const canvas = this.ctx.canvas;
        const self = this;

        canvas.addEventListener('click', (e) => {
            const clickedFicha = self.findClickedFicha(e.layerX, e.layerY);
            if (clickedFicha != null) {
                self.ctx.beginPath();
                self.ctx.arc(
                    self.x + self.size / 2,
                    self.y + self.size / 2,
                    self.size / 3,
                    0,
                    Math.PI * 2
                );
                self.ctx.lineWidth = 15;
                self.ctx.lineCap = 'round';
                self.ctx.strokeStyle = '#160404ff';
                self.ctx.stroke();
                self.ctx.closePath();
            }
        });
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

    addFicha(ficha) {
        this.fichas.push(ficha);
    }
}
