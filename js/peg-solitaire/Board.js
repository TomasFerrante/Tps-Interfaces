// ========================================================================================
// CLASE BOARD - Tablero de Peg Solitaire
// ========================================================================================

class Board {
    constructor(x, y, width, height, ctx) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.ctx = ctx;
        this.cells = [];
        this.cellSize = 40;
        this.pattern = null;
        this.canvas = ctx.canvas;
    }

    initialize() {
        // Patrón del tablero de Peg Solitaire
        // -1: espacio inválido
        //  0: espacio vacío (centro)
        //  1: ficha presente
        const initialBoard = [
            [-1, -1, 1, 1, 1, -1, -1],
            [-1, -1, 1, 1, 1, -1, -1],
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 0, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1],
            [-1, -1, 1, 1, 1, -1, -1],
            [-1, -1, 1, 1, 1, -1, -1]
        ];

        for (let row = 0; row < initialBoard.length; row++) {
            this.cells[row] = [];
            for (let col = 0; col < initialBoard[row].length; col++) {
                const cellX = this.x + col * this.cellSize;
                const cellY = this.y + row * this.cellSize;
                this.cells[row][col] = new Cell(
                    initialBoard[row][col],
                    cellX,
                    cellY,
                    this.cellSize,
                    this.ctx
                );
            }
        }
    }

    loadBackgroundImage(callback) {
        // Crear patrón generado dinámicamente en lugar de cargar imagen
        this.pattern = this.createBackgroundPattern();
        if (callback) callback();
    }

    createBackgroundPattern() {
        // Crear un canvas temporal para el patrón
        const patternCanvas = document.createElement('canvas');
        const patternSize = 80;
        patternCanvas.width = patternSize;
        patternCanvas.height = patternSize;
        const pCtx = patternCanvas.getContext('2d');

        // Fondo base con gradiente azul oscuro/gris carbón
        const baseGradient = pCtx.createLinearGradient(0, 0, patternSize, patternSize);
        baseGradient.addColorStop(0, '#1a1f2e');
        baseGradient.addColorStop(0.5, '#2a2f3f');
        baseGradient.addColorStop(1, '#1a1f2e');
        pCtx.fillStyle = baseGradient;
        pCtx.fillRect(0, 0, patternSize, patternSize);

        // Patrón de hexágonos sutiles
        this.drawHexagonPattern(pCtx, patternSize);

        // Agregar detalles brillantes
        this.addPatternDetails(pCtx, patternSize);

        // Crear el patrón repetible
        return this.ctx.createPattern(patternCanvas, 'repeat');
    }

    drawHexagonPattern(pCtx, size) {
        pCtx.save();
        // Hexágonos en cian/azul muy sutil
        pCtx.strokeStyle = 'rgba(100, 180, 200, 0.12)';
        pCtx.lineWidth = 1.5;

        const hexSize = size / 3;
        const centerX = size / 2;
        const centerY = size / 2;

        // Dibujar hexágono central
        this.drawHexagon(pCtx, centerX, centerY, hexSize);

        // Dibujar hexágonos en las esquinas (patrón repetible)
        this.drawHexagon(pCtx, 0, 0, hexSize);
        this.drawHexagon(pCtx, size, 0, hexSize);
        this.drawHexagon(pCtx, 0, size, hexSize);
        this.drawHexagon(pCtx, size, size, hexSize);

        pCtx.restore();
    }

    drawHexagon(pCtx, x, y, radius) {
        pCtx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const hx = x + radius * Math.cos(angle);
            const hy = y + radius * Math.sin(angle);
            if (i === 0) {
                pCtx.moveTo(hx, hy);
            } else {
                pCtx.lineTo(hx, hy);
            }
        }
        pCtx.closePath();
        pCtx.stroke();
    }

    addPatternDetails(pCtx, size) {
        pCtx.save();

        // Agregar pequeños destellos en tonos dorados y cianes
        const sparkles = [
            { x: size * 0.2, y: size * 0.3, size: 1.5, color: 'gold' },
            { x: size * 0.7, y: size * 0.2, size: 1, color: 'cyan' },
            { x: size * 0.4, y: size * 0.6, size: 1.2, color: 'gold' },
            { x: size * 0.8, y: size * 0.7, size: 1, color: 'cyan' },
            { x: size * 0.15, y: size * 0.85, size: 1.3, color: 'gold' }
        ];

        sparkles.forEach(sparkle => {
            const isGold = sparkle.color === 'gold';
            const mainColor = isGold
                ? 'rgba(247, 183, 49, 0.3)'
                : 'rgba(100, 200, 255, 0.25)';
            const glowColor = isGold
                ? 'rgba(247, 183, 49, 0.15)'
                : 'rgba(100, 200, 255, 0.12)';

            // Punto central brillante
            pCtx.fillStyle = mainColor;
            pCtx.beginPath();
            pCtx.arc(sparkle.x, sparkle.y, sparkle.size, 0, Math.PI * 2);
            pCtx.fill();

            // Brillo alrededor
            pCtx.fillStyle = glowColor;
            pCtx.beginPath();
            pCtx.arc(sparkle.x, sparkle.y, sparkle.size * 1.5, 0, Math.PI * 2);
            pCtx.fill();
        });

        // Líneas diagonales muy sutiles en gris azulado
        pCtx.strokeStyle = 'rgba(100, 150, 180, 0.08)';
        pCtx.lineWidth = 0.5;
        pCtx.beginPath();
        pCtx.moveTo(0, 0);
        pCtx.lineTo(size, size);
        pCtx.stroke();

        pCtx.beginPath();
        pCtx.moveTo(size, 0);
        pCtx.lineTo(0, size);
        pCtx.stroke();

        // Agregar algunos puntos pequeños de textura
        const dots = [
            { x: size * 0.5, y: size * 0.15 },
            { x: size * 0.3, y: size * 0.75 },
            { x: size * 0.9, y: size * 0.4 }
        ];

        pCtx.fillStyle = 'rgba(138, 56, 245, 0.08)';
        dots.forEach(dot => {
            pCtx.beginPath();
            pCtx.arc(dot.x, dot.y, 0.8, 0, Math.PI * 2);
            pCtx.fill();
        });

        pCtx.restore();
    }

    draw() {
        // Dibujar marco decorativo del tablero
        this.drawBoardFrame();

        // Dibujar todas las celdas
        for (let row = 0; row < this.cells.length; row++) {
            for (let col = 0; col < this.cells[row].length; col++) {
                this.cells[row][col].draw(this.pattern);
            }
        }

        // Dibujar borde brillante sobre el tablero
        this.drawBoardGlow();
    }

    drawBoardFrame() {
        const boardSize = this.cellSize * 7;
        const padding = 15;

        // Sombra exterior del tablero
        this.ctx.save();
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = 30;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 10;

        // Marco exterior con gradiente morado
        const outerGradient = this.ctx.createLinearGradient(
            this.x - padding,
            this.y - padding,
            this.x - padding,
            this.y + boardSize + padding
        );
        outerGradient.addColorStop(0, '#5603ad');
        outerGradient.addColorStop(0.5, '#8a38f5');
        outerGradient.addColorStop(1, '#5603ad');

        this.ctx.fillStyle = outerGradient;
        this.ctx.beginPath();
        this.ctx.roundRect(
            this.x - padding,
            this.y - padding,
            boardSize + padding * 2,
            boardSize + padding * 2,
            20
        );
        this.ctx.fill();
        this.ctx.restore();

        // Marco interior con gradiente dorado
        const innerPadding = 8;
        const innerGradient = this.ctx.createLinearGradient(
            this.x - innerPadding,
            this.y - innerPadding,
            this.x - innerPadding,
            this.y + boardSize + innerPadding
        );
        innerGradient.addColorStop(0, '#f7b731');
        innerGradient.addColorStop(0.5, '#ffd32a');
        innerGradient.addColorStop(1, '#f7b731');

        this.ctx.strokeStyle = innerGradient;
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.roundRect(
            this.x - innerPadding,
            this.y - innerPadding,
            boardSize + innerPadding * 2,
            boardSize + innerPadding * 2,
            15
        );
        this.ctx.stroke();
    }

    drawBoardGlow() {
        const boardSize = this.cellSize * 7;
        const padding = 8;

        // Brillo sutil alrededor del tablero
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(138, 56, 245, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.shadowColor = '#8a38f5';
        this.ctx.shadowBlur = 15;
        this.ctx.beginPath();
        this.ctx.roundRect(
            this.x - padding,
            this.y - padding,
            boardSize + padding * 2,
            boardSize + padding * 2,
            15
        );
        this.ctx.stroke();
        this.ctx.restore();
    }

    setColor(color) {
        this.pattern = color;
    }

    setChipImage(chipImage) {
        // Actualizar todas las celdas con la nueva imagen de ficha
        for (let row = 0; row < this.cells.length; row++) {
            for (let col = 0; col < this.cells[row].length; col++) {
                this.cells[row][col].setChipImage(chipImage);
            }
        }
    }
}
