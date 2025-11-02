// ========================================================================================
// VISTA - BoardView.js
// SOLO renderizado (sin lógica del juego)
// ========================================================================================

class BoardView {
  constructor(ctx, offsetX, offsetY, cellSize) {
    this.ctx = ctx;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.cellSize = cellSize;
  }

  // ========================================================================================
  // DIBUJAR TODO (llama a los métodos específicos)
  // ========================================================================================

  draw(boardState, timerData, remainingChips, validMoves) {
    this.drawBoardBackground();
    this.drawBoard(boardState, validMoves);
    this.drawPegs(boardState);
    this.drawHUD(timerData, remainingChips);
  }

  // ========================================================================================
  // DIBUJAR FONDO DEL TABLERO
  // ========================================================================================

  drawBoardBackground() {
    const ctx = this.ctx;
    const boardSize = 7 * this.cellSize;
    const padding = 20;
    const x = this.offsetX - padding;
    const y = this.offsetY - padding;
    const width = boardSize + padding * 2;
    const height = boardSize + padding * 2;

    ctx.save();

    // Sombra del contenedor
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 40;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 10;

    // Fondo oscuro del tablero
    const bgGradient = ctx.createLinearGradient(x, y, x, y + height);
    bgGradient.addColorStop(0, "#1a0033");
    bgGradient.addColorStop(0.5, "#0d001a");
    bgGradient.addColorStop(1, "#1a0033");

    ctx.fillStyle = bgGradient;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 15);
    ctx.fill();

    // Borde brillante morado
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#5603ad";
    ctx.strokeStyle = "#5603ad";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Borde interior más sutil
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#3a0477";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x + 2, y + 2, width - 4, height - 4, 13);
    ctx.stroke();

    ctx.restore();
  }

  // ========================================================================================
  // DIBUJAR TABLERO
  // ========================================================================================

  drawBoard(boardState, validMoves = []) {
    const ctx = this.ctx;
    const size = this.cellSize;

    for (let row = 0; row < boardState.cells.length; row++) {
      for (let col = 0; col < boardState.cells[row].length; col++) {
        const cell = boardState.cells[row][col];

        if (cell.value === -1) continue; // Espacios inválidos

        const x = this.offsetX + col * size;
        const y = this.offsetY + row * size;

        ctx.save();

        // Sombra del círculo
        ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;

        // Círculo base (hueco)
        const baseGradient = ctx.createRadialGradient(
          x + size / 2,
          y + size / 2,
          size * 0.1,
          x + size / 2,
          y + size / 2,
          size * 0.4
        );
        baseGradient.addColorStop(0, "#2d0052");
        baseGradient.addColorStop(0.6, "#1a0033");
        baseGradient.addColorStop(1, "#0d001a");

        ctx.fillStyle = baseGradient;
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Borde interior más oscuro (profundidad)
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#0a0015";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Borde exterior brillante
        ctx.strokeStyle = "#5603ad";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size * 0.42, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();

        // Resaltar celdas de movimientos válidos
        if (validMoves.some((move) => move.row === row && move.col === col)) {
          ctx.save();

          // Glow verde para movimientos válidos
          ctx.shadowColor = "#03ad56";
          ctx.shadowBlur = 15;

          ctx.strokeStyle = "#03ad56";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(x + size / 2, y + size / 2, size * 0.42, 0, Math.PI * 2);
          ctx.stroke();

          // Relleno semi-transparente
          ctx.shadowBlur = 0;
          ctx.fillStyle = "rgba(3, 173, 86, 0.2)";
          ctx.beginPath();
          ctx.arc(x + size / 2, y + size / 2, size * 0.4, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      }
    }
  }

  // ========================================================================================
  // DIBUJAR FICHAS
  // ========================================================================================

  drawPegs(boardState) {
    const ctx = this.ctx;

    for (let row = 0; row < boardState.cells.length; row++) {
      for (let col = 0; col < boardState.cells[row].length; col++) {
        const cell = boardState.cells[row][col];

        if (!cell.hasChip) continue;

        // Coordenadas de la celda
        const cellX = this.offsetX + col * this.cellSize;
        const cellY = this.offsetY + row * this.cellSize;

        // Centro de la celda
        const centerX = cellX + this.cellSize / 2;
        const centerY = cellY + this.cellSize / 2;

        const imgSize = this.cellSize * 0.98;
        const imgRadius = imgSize / 2;

        ctx.save();

        // MEJORA DE CALIDAD
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Dibujar imagen de ficha si está disponible
        if (cell.chipImage) {
          // Sombra de la ficha
          ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
          ctx.shadowBlur = 10;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 5;

          // Dibujar la imagen de la ficha
          ctx.shadowColor = "transparent";
          ctx.drawImage(
            cell.chipImage,
            centerX - imgRadius,
            centerY - imgRadius,
            imgSize,
            imgSize
          );

          // Borde brillante si está seleccionada
          if (cell.chipSelected) {
            ctx.strokeStyle = "#00ff88";
            ctx.lineWidth = 3;
            ctx.shadowColor = "#00ff88";
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.beginPath();
            ctx.arc(centerX, centerY, imgRadius, 0, Math.PI * 2);
            ctx.stroke();
          }
        } else {
          // Fallback: círculo dorado GRANDE
          ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
          ctx.shadowBlur = 10;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 5;

          const gradient = ctx.createRadialGradient(
            centerX - imgRadius / 3,
            centerY - imgRadius / 3,
            0,
            centerX,
            centerY,
            imgRadius
          );
          gradient.addColorStop(0, "#ffd32a");
          gradient.addColorStop(0.3, "#f7b731");
          gradient.addColorStop(0.7, "#e08e00");
          gradient.addColorStop(1, "#b87100");

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(centerX, centerY, imgRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = "#e08e00";
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        ctx.restore();
      }
    }
  }

  // ========================================================================================
  // DIBUJAR HUD (Timer, fichas, botón reiniciar)
  // ========================================================================================

  drawHUD(timerData, remainingChips) {
    const ctx = this.ctx;

    // Timer en la esquina superior izquierda
    ctx.save();
    ctx.font = 'bold 28px "Titillium Web", sans-serif';
    ctx.textAlign = "left";
    ctx.fillStyle = timerData.color;

    // Sombra dinámica según el tiempo
    if (timerData.color === "#f25022") {
      ctx.shadowColor = "rgba(242, 80, 34, 0.8)";
      ctx.shadowBlur = 15;
    } else if (timerData.color === "#f7b731") {
      ctx.shadowColor = "rgba(247, 183, 49, 0.6)";
      ctx.shadowBlur = 12;
    } else {
      ctx.shadowColor = "rgba(3, 173, 86, 0.5)";
      ctx.shadowBlur = 10;
    }

    ctx.fillText(`⏱ ${timerData.formattedTime}`, 30, 40);
    ctx.restore();

    // Contador de fichas restantes
    ctx.save();
    ctx.font = 'bold 20px "Titillium Web", sans-serif';
    ctx.fillStyle = "#74e0a9";
    ctx.shadowColor = "rgba(116, 224, 169, 0.3)";
    ctx.shadowBlur = 8;
    ctx.fillText(`🎯 Fichas: ${remainingChips}`, 30, 75);
    ctx.restore();

    // Botón de reiniciar
    this.drawRestartButton();
    // Botón de volver al menu principal
    this.drawBackButton();
  }

  drawRestartButton() {
    const ctx = this.ctx;
    const btnX = 1340 - 210; // Ajustado para mejor posición
    const btnY = 20;
    const btnWidth = 180;
    const btnHeight = 60;
    const borderRadius = 30; // Muy redondeado

    ctx.save();

    // Sombra del botón
    ctx.shadowColor = "rgba(242, 80, 34, 0.6)";
    ctx.shadowBlur = 25;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 8;

    // Fondo naranja brillante del botón
    const gradient = ctx.createLinearGradient(
      btnX,
      btnY,
      btnX,
      btnY + btnHeight
    );
    gradient.addColorStop(0, "#ff7851");
    gradient.addColorStop(1, "#f25022");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(btnX, btnY, btnWidth, btnHeight, borderRadius);
    ctx.fill();

    // Highlight sutil en la parte superior
    ctx.shadowBlur = 0;
    const highlightGradient = ctx.createLinearGradient(
      btnX,
      btnY,
      btnX,
      btnY + btnHeight * 0.5
    );
    highlightGradient.addColorStop(0, "rgba(255, 255, 255, 0.2)");
    highlightGradient.addColorStop(1, "transparent");

    ctx.fillStyle = highlightGradient;
    ctx.beginPath();
    ctx.roundRect(btnX, btnY, btnWidth, btnHeight * 0.5, [
      borderRadius,
      borderRadius,
      0,
      0,
    ]);
    ctx.fill();

    // Texto del botón
    ctx.fillStyle = "#ffffff";
    ctx.font = 'bold 24px "Titillium Web", sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    ctx.shadowBlur = 3;
    ctx.shadowOffsetY = 2;
    ctx.fillText("Reiniciar", btnX + btnWidth / 2, btnY + btnHeight / 2);

    ctx.restore();

    // Guardar bounds para el controlador
    this.restartButtonBounds = {
      x: btnX,
      y: btnY,
      width: btnWidth,
      height: btnHeight,
    };
  }

  drawBackButton() {
    const ctx = this.ctx;
    const btnX = CANVAS_WIDTH_PEG - 210; // Ajustado para mejor posición
    const btnY = 430;
    const btnWidth = 180;
    const btnHeight = 60;
    const borderRadius = 30;

    ctx.save();

    // Gradiente naranja del botón
    const gradient = ctx.createLinearGradient(
      btnX,
      btnY,
      btnX,
      btnY + btnHeight
    );
    gradient.addColorStop(1, "#5603ad");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(btnX, btnY, btnWidth, btnHeight, borderRadius);
    ctx.fill();

    // Sin borde visible
    ctx.shadowBlur = 0;

    // Texto del botón
    ctx.fillStyle = "#ffffff";
    ctx.font = 'bold 20px "Titillium Web", sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Menú Principal", btnX + btnWidth / 2, btnY + btnHeight / 2);

    ctx.restore();

    // Guardar bounds para el controlador
    this.backButtonBounds = {
      x: btnX,
      y: btnY,
      width: btnWidth,
      height: btnHeight,
    };
  }

  // ========================================================================================
  // UTILIDADES DE CONVERSIÓN (para el controlador)
  // ========================================================================================

  canvasToCell(x, y) {
    const col = Math.floor((x - this.offsetX) / this.cellSize);
    const row = Math.floor((y - this.offsetY) / this.cellSize);

    if (row >= 0 && row < 7 && col >= 0 && col < 7) {
      return { row, col };
    }
    return null;
  }

  isRestartButtonClicked(x, y) {
    if (!this.restartButtonBounds) return false;

    const bounds = this.restartButtonBounds;
    return (
      x >= bounds.x &&
      x <= bounds.x + bounds.width &&
      y >= bounds.y &&
      y <= bounds.y + bounds.height
    );
  }

  isBackButtonClicked(x, y) {
    if (!this.backButtonBounds) return false;

    const bounds = this.backButtonBounds;
    return (
      x >= bounds.x &&
      x <= bounds.x + bounds.width &&
      y >= bounds.y &&
      y <= bounds.y + bounds.height
    );
  }
}
