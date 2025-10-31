class BoardView {
  constructor(ctx, x, y, cellSize) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.cellSize = cellSize;
    this.pattern = null;
    this.loadBackgroundImage();
  }

  loadBackgroundImage(callback) {
    // Crear patrón generado dinámicamente en lugar de cargar imagen
    this.pattern = this.createBackgroundPattern();
    if (callback) callback();
  }

  createBackgroundPattern() {
    // Crear un canvas temporal para el patrón
    const patternCanvas = document.createElement("canvas");
    const patternSize = 80;
    patternCanvas.width = patternSize;
    patternCanvas.height = patternSize;
    const pCtx = patternCanvas.getContext("2d");

    // Fondo base con gradiente azul oscuro/gris carbón
    const baseGradient = pCtx.createLinearGradient(
      0,
      0,
      patternSize,
      patternSize
    );
    baseGradient.addColorStop(0, "#1a1f2e");
    baseGradient.addColorStop(0.5, "#2a2f3f");
    baseGradient.addColorStop(1, "#1a1f2e");
    pCtx.fillStyle = baseGradient;
    pCtx.fillRect(0, 0, patternSize, patternSize);

    // Patrón de hexágonos sutiles
    this.drawHexagonPattern(pCtx, patternSize);

    // Agregar detalles brillantes
    this.addPatternDetails(pCtx, patternSize);

    // Crear el patrón repetible
    return this.ctx.createPattern(patternCanvas, "repeat");
  }

  drawHexagonPattern(pCtx, size) {
    pCtx.save();
    // Hexágonos en cian/azul muy sutil
    pCtx.strokeStyle = "rgba(100, 180, 200, 0.12)";
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
      { x: size * 0.2, y: size * 0.3, size: 1.5, color: "gold" },
      { x: size * 0.7, y: size * 0.2, size: 1, color: "cyan" },
      { x: size * 0.4, y: size * 0.6, size: 1.2, color: "gold" },
      { x: size * 0.8, y: size * 0.7, size: 1, color: "cyan" },
      { x: size * 0.15, y: size * 0.85, size: 1.3, color: "gold" },
    ];

    sparkles.forEach((sparkle) => {
      const isGold = sparkle.color === "gold";
      const mainColor = isGold
        ? "rgba(247, 183, 49, 0.3)"
        : "rgba(100, 200, 255, 0.25)";
      const glowColor = isGold
        ? "rgba(247, 183, 49, 0.15)"
        : "rgba(100, 200, 255, 0.12)";

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
    pCtx.strokeStyle = "rgba(100, 150, 180, 0.08)";
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
      { x: size * 0.9, y: size * 0.4 },
    ];

    pCtx.fillStyle = "rgba(138, 56, 245, 0.08)";
    dots.forEach((dot) => {
      pCtx.beginPath();
      pCtx.arc(dot.x, dot.y, 0.8, 0, Math.PI * 2);
      pCtx.fill();
    });

    pCtx.restore();
  }

  draw(boardState, dragInfo = null) {
    this.drawBoardFrame();

    // Dibujar celdas usando los datos recibidos
    boardState.cells.forEach((row, rowIndex) => {
      row.forEach((cellData, colIndex) => {
        const { x, y } = this.logicalToScreen(rowIndex, colIndex);

        const isDraggedCell =
          dragInfo &&
          dragInfo.fromRow === rowIndex &&
          dragInfo.fromCol === colIndex;

        this.drawCell(cellData, x, y, isDraggedCell);
      });
    });

    this.drawBoardGlow();

    if (dragInfo) {
      this.drawDraggedChip(dragInfo);
    }
  }

  drawCell(cellData, x, y, skipChip = false) {
    if (cellData.value === -1) return;

    // Dibujar fondo
    this.ctx.fillStyle = this.pattern || "#2a1a4a";
    this.ctx.fillRect(x, y, this.cellSize, this.cellSize);

    this.drawCellBevel(x, y, this.cellSize);
    this.drawChipSocket(x, y, this.cellSize);

    // Dibujar ficha si existe
    if (cellData.hasChip && !skipChip) {
      this.drawChip(cellData, x, y, this.cellSize);
    }
  }

  drawBoardFrame() {
    const boardSize = this.cellSize * 7;
    const padding = 15;

    // Sombra exterior del tablero
    this.ctx.save();
    this.ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
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
    outerGradient.addColorStop(0, "#5603ad");
    outerGradient.addColorStop(0.5, "#8a38f5");
    outerGradient.addColorStop(1, "#5603ad");

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
    innerGradient.addColorStop(0, "#f7b731");
    innerGradient.addColorStop(0.5, "#ffd32a");
    innerGradient.addColorStop(1, "#f7b731");

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
    this.ctx.strokeStyle = "rgba(138, 56, 245, 0.3)";
    this.ctx.lineWidth = 2;
    this.ctx.shadowColor = "#8a38f5";
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

  screenToLogical(screenX, screenY) {
    if (screenX < this.x || screenY < this.y) return null;

    const relX = screenX - this.x;
    const relY = screenY - this.y;

    const col = Math.floor(relX / this.cellSize);
    const row = Math.floor(relY / this.cellSize);

    if (row < 0 || row >= 7 || col < 0 || col >= 7) {
      return null;
    }

    return { row, col };
  }

  logicalToScreen(row, col) {
    return {
      x: this.x + col * this.cellSize,
      y: this.y + row * this.cellSize,
    };
  }
  
  drawCellBevel(x, y, size) {
    const darkGradient = this.ctx.createLinearGradient(x, y, x + size / 4, y + size / 4);
    darkGradient.addColorStop(0, "rgba(0, 0, 0, 0.3)");
    darkGradient.addColorStop(1, "transparent");
    this.ctx.fillStyle = darkGradient;
    this.ctx.fillRect(x, y, size / 4, size / 4);

    const lightGradient = this.ctx.createLinearGradient(
      x + size,
      y + size,
      x + (size * 3) / 4,
      y + (size * 3) / 4
    );
    lightGradient.addColorStop(0, "rgba(255, 255, 255, 0.2)");
    lightGradient.addColorStop(1, "transparent");
    this.ctx.fillStyle = lightGradient;
    this.ctx.fillRect(x + (size * 3) / 4, y + (size * 3) / 4, size / 4, size / 4);

    const borderGradient = this.ctx.createLinearGradient(x, y, x, y + size);
    borderGradient.addColorStop(0, "rgba(138, 56, 245, 0.3)");
    borderGradient.addColorStop(0.5, "rgba(138, 56, 245, 0.1)");
    borderGradient.addColorStop(1, "rgba(138, 56, 245, 0.3)");
    this.ctx.strokeStyle = borderGradient;
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, size, size);
  }

  drawChipSocket(x, y, size, hasChip = false) {
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    const radius = size / 3;

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    this.ctx.fill();

    const socketGradient = this.ctx.createRadialGradient(
      centerX - radius / 3,
      centerY - radius / 3,
      0,
      centerX,
      centerY,
      radius
    );

    if (hasChip) {
      socketGradient.addColorStop(0, "rgba(138, 56, 245, 0.2)");
      socketGradient.addColorStop(0.7, "rgba(86, 3, 173, 0.3)");
      socketGradient.addColorStop(1, "rgba(16, 5, 39, 0.5)");
    } else {
      socketGradient.addColorStop(0, "rgba(16, 5, 39, 0.8)");
      socketGradient.addColorStop(0.7, "rgba(0, 0, 0, 0.6)");
      socketGradient.addColorStop(1, "rgba(0, 0, 0, 0.9)");
    }

    this.ctx.fillStyle = socketGradient;
    this.ctx.fill();

    this.ctx.strokeStyle = hasChip
      ? "rgba(247, 183, 49, 0.3)"
      : "rgba(138, 56, 245, 0.2)";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawChip(cellData, x, y, size) {
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    const radius = size / 3;

    this.ctx.save();

    if (cellData.chipImage) {
      this.drawCustomChip(cellData, centerX, centerY, radius);
    } else {
      this.drawDefaultChip(cellData.chipSelected, centerX, centerY, radius);
    }

    this.ctx.restore();
  }

  drawCustomChip(cellData, centerX, centerY, radius) {
    this.ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
    this.ctx.shadowBlur = 8;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 4;

    if (cellData.chipSelected) {
      const bgGradient = this.ctx.createRadialGradient(
        centerX - radius / 3,
        centerY - radius / 3,
        0,
        centerX,
        centerY,
        radius * 1.2
      );
      bgGradient.addColorStop(0, "#ffd32a");
      bgGradient.addColorStop(0.5, "#f7b731");
      bgGradient.addColorStop(1, "#e08e00");

      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius * 1.15, 0, Math.PI * 2);
      this.ctx.fillStyle = bgGradient;
      this.ctx.fill();
    }

    this.ctx.shadowColor = "transparent";
    const imgSize = radius * 2;
    this.ctx.drawImage(
      cellData.chipImage,
      centerX - imgSize / 2,
      centerY - imgSize / 2,
      imgSize,
      imgSize
    );

    if (cellData.chipSelected) {
      this.ctx.strokeStyle = "#fff4d6";
      this.ctx.lineWidth = 3;
      this.ctx.shadowColor = "#ffd32a";
      this.ctx.shadowBlur = 10;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius * 1.05, 0, Math.PI * 2);
      this.ctx.stroke();
    }
  }

  drawDefaultChip(isSelected, centerX, centerY, radius) {
    this.ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
    this.ctx.shadowBlur = 8;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 4;

    const chipGradient = this.ctx.createRadialGradient(
      centerX - radius / 3,
      centerY - radius / 3,
      0,
      centerX,
      centerY,
      radius
    );

    if (isSelected) {
      chipGradient.addColorStop(0, "#ffd32a");
      chipGradient.addColorStop(0.3, "#f7b731");
      chipGradient.addColorStop(0.7, "#e08e00");
      chipGradient.addColorStop(1, "#b87100");
    } else {
      chipGradient.addColorStop(0, "#e8e8e8");
      chipGradient.addColorStop(0.3, "#c5c5c5");
      chipGradient.addColorStop(0.7, "#8a8a8a");
      chipGradient.addColorStop(1, "#5a5a5a");
    }

    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = chipGradient;
    this.ctx.fill();

    const borderGradient = this.ctx.createLinearGradient(
      centerX,
      centerY - radius,
      centerX,
      centerY + radius
    );

    if (isSelected) {
      borderGradient.addColorStop(0, "#fff4d6");
      borderGradient.addColorStop(0.5, "#f7b731");
      borderGradient.addColorStop(1, "#8a6000");
    } else {
      borderGradient.addColorStop(0, "#ffffff");
      borderGradient.addColorStop(0.5, "#a0a0a0");
      borderGradient.addColorStop(1, "#404040");
    }

    this.ctx.strokeStyle = borderGradient;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  drawDraggedChip(dragInfo) {
    const { chipData, currentX, currentY } = dragInfo;

    this.ctx.save();

    this.ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    this.ctx.shadowBlur = 20;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 10;

    this.drawChip(
      chipData,
      currentX - this.cellSize / 2,
      currentY - this.cellSize / 2,
      this.cellSize
    );

    this.ctx.restore();
  }
}
