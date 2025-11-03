// ========================================================================================
// VISTA - BoardView.js
// SOLO renderizado (sin lógica del juego)
// ========================================================================================

// ========================================================================================
// CLASE BUTTON - Para botones en pantallas de fin de juego
// ========================================================================================

class PegButton {
  constructor(x, y, width, height, text, callback, color = '#03ad56', hoverColor = '#74e0a9') {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.text = text;
    this.callback = callback;
    this.color = color;
    this.hoverColor = hoverColor;
    this.isHovered = false;
  }

  draw(ctx) {
    // Fondo del botón con gradiente
    const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
    if (this.isHovered) {
      gradient.addColorStop(0, this.hoverColor);
      gradient.addColorStop(1, this.color);
    } else {
      gradient.addColorStop(0, this.color);
      gradient.addColorStop(1, this.color + 'cc');
    }

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, 25);
    ctx.fill();

    // Sombra para efecto 3D
    if (this.isHovered) {
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 5;
    }

    // Borde
    ctx.strokeStyle = this.isHovered ? '#ffffff' : this.color + '44';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Resetear sombra
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Texto
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Titillium Web", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2);
  }

  isPointInside(x, y) {
    return x >= this.x && x <= this.x + this.width &&
           y >= this.y && y <= this.y + this.height;
  }

  handleClick() {
    if (this.callback) {
      this.callback();
    }
  }
}

// ========================================================================================
// VISTA
// ========================================================================================

class BoardView {
  constructor(ctx, offsetX, offsetY, cellSize) {
    this.ctx = ctx;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.cellSize = cellSize;

    // Botones para pantallas de fin de juego
    this.endGameButtons = [];

    // Cargar imagen de fondo del tablero
    this.backgroundImage = new Image();
    this.backgroundImage.src = '../assets/images/fondo_peg.webp';
    this.backgroundImageLoaded = false;
    this.backgroundImage.onload = () => {
      this.backgroundImageLoaded = true;
    };
    this.backgroundImage.onerror = () => {
      console.error('Error al cargar la imagen de fondo del tablero');
    };
  }

  // ========================================================================================
  // DIBUJAR TODO (llama a los métodos específicos)
  // ========================================================================================

  draw(boardState, timerData, remainingChips, validMoves, dragData) {
    this.drawBoardBackground();
    this.drawBoard(boardState, validMoves);
    this.drawPegs(boardState, dragData);
    this.drawHUD(timerData, remainingChips);

    // Dibujar la ficha siendo arrastrada (debe dibujarse al final para estar encima de todo)
    if (dragData && dragData.isDragging) {
      this.drawDraggedChip(boardState, dragData);
    }
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

    // Crear el path con bordes redondeados para recortar
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 15);

    // Si la imagen está cargada, dibujarla como fondo
    if (this.backgroundImageLoaded) {
      ctx.save();
      ctx.clip(); // Recortar para que la imagen siga los bordes redondeados

      // Dibujar la imagen de fondo
      ctx.drawImage(this.backgroundImage, x, y, width, height);

      // Agregar filtro blanco semi-transparente para aclarar la imagen
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.fillRect(x, y, width, height);

      ctx.restore();
    } else {
      // Fallback: Fondo oscuro del tablero mientras carga la imagen
      const bgGradient = ctx.createLinearGradient(x, y, x, y + height);
      bgGradient.addColorStop(0, "#1a0033");
      bgGradient.addColorStop(0.5, "#0d001a");
      bgGradient.addColorStop(1, "#1a0033");

      ctx.fillStyle = bgGradient;
      ctx.fill();
    }

    // Borde brillante morado
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#5603ad";
    ctx.strokeStyle = "#5603ad";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 15);
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

  drawPegs(boardState, dragData) {
    const ctx = this.ctx;

    for (let row = 0; row < boardState.cells.length; row++) {
      for (let col = 0; col < boardState.cells[row].length; col++) {
        const cell = boardState.cells[row][col];

        if (!cell.hasChip) continue;

        // No dibujar la ficha que está siendo arrastrada
        if (
          dragData &&
          dragData.isDragging &&
          dragData.draggedChip &&
          dragData.draggedChip.row === row &&
          dragData.draggedChip.col === col
        ) {
          continue;
        }

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

  // ========================================================================================
  // DIBUJAR FICHA ARRASTRADA
  // ========================================================================================

  drawDraggedChip(boardState, dragData) {
    if (!dragData.dragPosition || !dragData.draggedChip) return;

    const ctx = this.ctx;
    const { row, col } = dragData.draggedChip;
    const { x, y } = dragData.dragPosition;

    // Obtener la información de la ficha desde el boardState
    const cell = boardState.cells[row][col];
    if (!cell) return;

    const imgSize = this.cellSize * 0.98;
    const imgRadius = imgSize / 2;

    ctx.save();

    // MEJORA DE CALIDAD
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Sombra más pronunciada para la ficha arrastrada
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 10;

    // Dibujar la imagen de la ficha centrada en el cursor
    if (cell.chipImage) {
      ctx.drawImage(
        cell.chipImage,
        x - imgRadius,
        y - imgRadius,
        imgSize,
        imgSize
      );

      // Borde brillante animado
      ctx.strokeStyle = "#00ff88";
      ctx.lineWidth = 4;
      ctx.shadowColor = "#00ff88";
      ctx.shadowBlur = 25;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.beginPath();
      ctx.arc(x, y, imgRadius, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Fallback: círculo dorado
      const gradient = ctx.createRadialGradient(
        x - imgRadius / 3,
        y - imgRadius / 3,
        0,
        x,
        y,
        imgRadius
      );
      gradient.addColorStop(0, "#ffd32a");
      gradient.addColorStop(0.3, "#f7b731");
      gradient.addColorStop(0.7, "#e08e00");
      gradient.addColorStop(1, "#b87100");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, imgRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#e08e00";
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    ctx.restore();
  }

  // ========================================================================================
  // PANTALLAS DE FIN DE JUEGO
  // ========================================================================================

  drawVictoryScreen(timerData, onRestart, onBackToRoulette) {
    const ctx = this.ctx;
    const width = CANVAS_WIDTH_PEG;
    const height = CANVAS_HEIGHT_PEG;

    // Limpiar canvas
    this.clearCanvasForEndScreen(ctx, width, height);

    this.endGameButtons = [];

    // Título animado
    ctx.save();
    ctx.font = 'bold 60px "Titillium Web", sans-serif';
    ctx.textAlign = 'center';

    const titleGradient = ctx.createLinearGradient(0, 100, 0, 160);
    titleGradient.addColorStop(0, '#03ad56');
    titleGradient.addColorStop(0.5, '#74e0a9');
    titleGradient.addColorStop(1, '#03ad56');
    ctx.fillStyle = titleGradient;

    ctx.shadowColor = '#03ad56';
    ctx.shadowBlur = 30;
    ctx.fillText('¡Felicitaciones!', width / 2, 130);
    ctx.shadowBlur = 0;

    // Tiempo final
    ctx.font = '28px "Titillium Web", sans-serif';
    ctx.fillStyle = '#e2e0e0';
    ctx.fillText(`Completaste el juego en ${timerData.formattedTime}`, width / 2, 200);

    // Mensaje adicional
    ctx.font = '22px "Titillium Web", sans-serif';
    ctx.fillStyle = '#74e0a9';
    ctx.fillText('¡Solo queda 1 ficha en el centro!', width / 2, 240);

    ctx.restore();

    // Botones
    const btnPlayAgain = new PegButton(
      width / 2 - 250,
      290,
      220,
      60,
      'Jugar de Nuevo',
      onRestart,
      '#03ad56',
      '#74e0a9'
    );

    const btnMenu = new PegButton(
      width / 2 + 30,
      290,
      220,
      60,
      'Menú Principal',
      onBackToRoulette,
      '#5603ad',
      '#8a38f5'
    );

    this.endGameButtons.push(btnPlayAgain, btnMenu);
    this.endGameButtons.forEach(btn => btn.draw(ctx));
  }

  drawDefeatScreen(remaining, timerData, onRestart, onBackToRoulette) {
    const ctx = this.ctx;
    const width = CANVAS_WIDTH_PEG;
    const height = CANVAS_HEIGHT_PEG;

    // Limpiar canvas
    this.clearCanvasForEndScreen(ctx, width, height);

    this.endGameButtons = [];

    // Título de derrota
    ctx.save();
    ctx.font = 'bold 60px "Titillium Web", sans-serif';
    ctx.textAlign = 'center';

    const titleGradient = ctx.createLinearGradient(0, 100, 0, 160);
    titleGradient.addColorStop(0, '#f25022');
    titleGradient.addColorStop(0.5, '#ff6b3d');
    titleGradient.addColorStop(1, '#f25022');
    ctx.fillStyle = titleGradient;

    ctx.shadowColor = '#f25022';
    ctx.shadowBlur = 30;
    ctx.fillText('Juego Terminado', width / 2, 130);
    ctx.shadowBlur = 0;

    // Mensaje
    ctx.font = '28px "Titillium Web", sans-serif';
    ctx.fillStyle = '#e2e0e0';
    ctx.fillText('No hay más movimientos disponibles', width / 2, 200);

    // Fichas restantes
    ctx.font = '22px "Titillium Web", sans-serif';
    ctx.fillStyle = '#74e0a9';
    ctx.fillText(`Fichas restantes: ${remaining} - Tiempo: ${timerData.formattedTime}`, width / 2, 240);

    ctx.restore();

    // Botones
    const btnRetry = new PegButton(
      width / 2 - 250,
      290,
      220,
      60,
      'Reintentar',
      onRestart,
      '#f25022',
      '#ff6b3d'
    );

    const btnMenu = new PegButton(
      width / 2 + 30,
      290,
      220,
      60,
      'Menú Principal',
      onBackToRoulette,
      '#5603ad',
      '#8a38f5'
    );

    this.endGameButtons.push(btnRetry, btnMenu);
    this.endGameButtons.forEach(btn => btn.draw(ctx));
  }

  drawTimeUpScreen(remaining, onRestart, onBackToRoulette) {
    const ctx = this.ctx;
    const width = CANVAS_WIDTH_PEG;
    const height = CANVAS_HEIGHT_PEG;

    // Limpiar canvas
    this.clearCanvasForEndScreen(ctx, width, height);

    this.endGameButtons = [];

    // Título de tiempo agotado
    ctx.save();
    ctx.font = 'bold 60px "Titillium Web", sans-serif';
    ctx.textAlign = 'center';

    const titleGradient = ctx.createLinearGradient(0, 100, 0, 160);
    titleGradient.addColorStop(0, '#f25022');
    titleGradient.addColorStop(0.5, '#ff6b3d');
    titleGradient.addColorStop(1, '#f25022');
    ctx.fillStyle = titleGradient;

    ctx.shadowColor = '#f25022';
    ctx.shadowBlur = 30;
    ctx.fillText('¡Tiempo Agotado!', width / 2, 130);
    ctx.shadowBlur = 0;

    // Mensaje
    ctx.font = '28px "Titillium Web", sans-serif';
    ctx.fillStyle = '#e2e0e0';
    ctx.fillText('Se acabó el tiempo antes de completar el juego', width / 2, 200);

    // Fichas restantes
    ctx.font = '22px "Titillium Web", sans-serif';
    ctx.fillStyle = '#74e0a9';
    ctx.fillText(`Fichas restantes: ${remaining}`, width / 2, 240);

    ctx.restore();

    // Botones
    const btnRetry = new PegButton(
      width / 2 - 250,
      290,
      220,
      60,
      'Reintentar',
      onRestart,
      '#f25022',
      '#ff6b3d'
    );

    const btnMenu = new PegButton(
      width / 2 + 30,
      290,
      220,
      60,
      'Menú Principal',
      onBackToRoulette,
      '#5603ad',
      '#8a38f5'
    );

    this.endGameButtons.push(btnRetry, btnMenu);
    this.endGameButtons.forEach(btn => btn.draw(ctx));
  }

  clearCanvasForEndScreen(ctx, width, height) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, width, height);

    // Fondo con gradiente morado
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#100527');
    gradient.addColorStop(0.5, '#3a0477');
    gradient.addColorStop(1, '#100527');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Estrellas de fondo
    this.drawBackgroundStarsStatic(ctx, width, height);

    // Viñeta
    this.drawVignetteStatic(ctx, width, height);

    ctx.restore();
  }

  drawBackgroundStarsStatic(ctx, width, height) {
    ctx.save();

    const seed = 12345;
    const random = (function (s) {
      return function () {
        s = Math.sin(s) * 10000;
        return s - Math.floor(s);
      };
    })(seed);

    for (let i = 0; i < 50; i++) {
      const x = random() * width;
      const y = random() * height;
      const size = random() * 2 + 0.5;
      const opacity = random() * 0.5 + 0.2;

      ctx.fillStyle = `rgba(138, 56, 245, ${opacity})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();

      if (i % 5 === 0) {
        ctx.shadowColor = '#8a38f5';
        ctx.shadowBlur = 5;
        ctx.fillStyle = `rgba(247, 183, 49, ${opacity * 0.8})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    ctx.restore();
  }

  drawVignetteStatic(ctx, width, height) {
    const vignetteGradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(width, height) / 3,
      width / 2,
      height / 2,
      Math.max(width, height) / 1.2
    );

    vignetteGradient.addColorStop(0, 'transparent');
    vignetteGradient.addColorStop(0.7, 'rgba(16, 5, 39, 0.3)');
    vignetteGradient.addColorStop(1, 'rgba(16, 5, 39, 0.7)');

    ctx.fillStyle = vignetteGradient;
    ctx.fillRect(0, 0, width, height);
  }

  // Método para obtener los botones (usado por el controlador)
  getEndGameButtons() {
    return this.endGameButtons;
  }
}
