// ========================================================================================
// CLASE CHIP - Ficha del juego
// ========================================================================================

class Chip {
    constructor(x, y, size, ctx, radius) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.selected = false;
        this.ctx = ctx;
        this.radius = radius || size / 3;
        this.fichas = [];
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.fillStyle = this.selected ? '#444' : '#000000b3';
        this.ctx.arc(
            this.x + this.size / 2,
            this.y + this.size / 2,
            this.size / 3,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
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
