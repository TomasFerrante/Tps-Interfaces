// ========================================================================================
// CLASE ChipView - Vista de ficha individual (EN DESUSO)
// NOTA: Esta clase no se utiliza activamente. BoardView.js maneja todo el renderizado.
// Se mantiene por compatibilidad con versiones anteriores del código.
// ========================================================================================

class ChipView {
  /**
   * Constructor de la vista de ficha
   * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
   */
  constructor(ctx) {
    this.ctx = ctx;
  }

  /**
   * Dibuja la ficha con efectos visuales 3D
   * Determina si usar imagen personalizada o ficha por defecto
   */
  draw() {
    const centerX = this.x + this.size / 2; // Centro X
    const centerY = this.y + this.size / 2; // Centro Y
    const radius = this.size / 3; // Radio de la ficha

    this.ctx.save();

    // Si hay imagen de ficha personalizada (campeón de LoL), dibujarla
    if (this.chipImage) {
      this.drawCustomChip(centerX, centerY, radius);
      this.ctx.restore();
      return;
    }

    // Sombra de la ficha para efecto 3D
    this.ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
    this.ctx.shadowBlur = 8;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 4;

    // Gradiente radial para efecto 3D (iluminación desde arriba izquierda)
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
      chipGradient.addColorStop(0, "#ffd32a");   // Amarillo brillante
      chipGradient.addColorStop(0.3, "#f7b731"); // Amarillo medio
      chipGradient.addColorStop(0.7, "#e08e00"); // Naranja
      chipGradient.addColorStop(1, "#b87100");   // Naranja oscuro
    } else {
      // Ficha normal - plateada con tonos morados
      chipGradient.addColorStop(0, "#e8e8e8");   // Plateado claro
      chipGradient.addColorStop(0.3, "#c5c5c5"); // Plateado medio
      chipGradient.addColorStop(0.7, "#8a8a8a"); // Gris
      chipGradient.addColorStop(1, "#5a5a5a");   // Gris oscuro
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
      // Borde dorado para ficha seleccionada
      borderGradient.addColorStop(0, "#fff4d6");  // Amarillo muy claro
      borderGradient.addColorStop(0.5, "#f7b731"); // Amarillo medio
      borderGradient.addColorStop(1, "#8a6000");   // Dorado oscuro
    } else {
      // Borde plateado para ficha normal
      borderGradient.addColorStop(0, "#ffffff");  // Blanco
      borderGradient.addColorStop(0.5, "#a0a0a0"); // Gris medio
      borderGradient.addColorStop(1, "#404040");   // Gris oscuro
    }

    this.ctx.strokeStyle = borderGradient;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Brillo superior (highlight) para efecto de superficie pulida
    this.ctx.shadowColor = "transparent";
    this.ctx.shadowBlur = 0;

    const highlightGradient = this.ctx.createRadialGradient(
      centerX - radius / 4,
      centerY - radius / 4,
      0,
      centerX - radius / 4,
      centerY - radius / 4,
      radius / 2
    );
    highlightGradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
    highlightGradient.addColorStop(0.5, "rgba(255, 255, 255, 0.3)");
    highlightGradient.addColorStop(1, "transparent");

    this.ctx.beginPath();
    this.ctx.arc(
      centerX - radius / 4,
      centerY - radius / 4,
      radius / 2,
      0,
      Math.PI * 2
    );
    this.ctx.fillStyle = highlightGradient;
    this.ctx.fill();

    // Diseño decorativo en el centro (estrella) si está seleccionada
    if (this.selected) {
      this.drawChipDecoration(centerX, centerY, radius);
    }

    this.ctx.restore();
  }

  /**
   * Dibuja una estrella decorativa en el centro de la ficha seleccionada
   * @param {number} centerX - Posición X del centro
   * @param {number} centerY - Posición Y del centro
   * @param {number} radius - Radio de la ficha
   */
  drawChipDecoration(centerX, centerY, radius) {
    // Estrella pequeña en el centro de la ficha seleccionada
    this.ctx.save();
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.9)"; // Blanco semi-transparente
    this.ctx.shadowColor = "#ffd32a"; // Sombra dorada
    this.ctx.shadowBlur = 10;

    const starRadius = radius / 4; // Radio de la estrella
    const points = 5; // Estrella de 5 puntas

    // Dibujar estrella usando trigonometría
    this.ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2; // Ángulo de cada punta
      const r = i % 2 === 0 ? starRadius : starRadius / 2; // Alternar entre puntas largas y cortas
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

  /**
   * Dibuja una ficha con imagen personalizada (campeón de League of Legends)
   * @param {number} centerX - Posición X del centro
   * @param {number} centerY - Posición Y del centro
   * @param {number} radius - Radio de la ficha
   */
  drawCustomChip(centerX, centerY, radius) {
    // Sombra de la ficha
    this.ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
    this.ctx.shadowBlur = 8;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 4;

    // Dibujar círculo de fondo dorado si está seleccionada
    if (this.selected) {
      const bgGradient = this.ctx.createRadialGradient(
        centerX - radius / 3,
        centerY - radius / 3,
        0,
        centerX,
        centerY,
        radius * 1.2
      );
      bgGradient.addColorStop(0, "#ffd32a");  // Amarillo brillante
      bgGradient.addColorStop(0.5, "#f7b731"); // Amarillo medio
      bgGradient.addColorStop(1, "#e08e00");   // Naranja

      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius * 1.15, 0, Math.PI * 2);
      this.ctx.fillStyle = bgGradient;
      this.ctx.fill();
    }

    // Dibujar la imagen de la ficha (campeón)
    this.ctx.shadowColor = "transparent";
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
      this.ctx.strokeStyle = "#fff4d6"; // Amarillo claro
      this.ctx.lineWidth = 3;
      this.ctx.shadowColor = "#ffd32a"; // Sombra dorada
      this.ctx.shadowBlur = 10;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius * 1.05, 0, Math.PI * 2);
      this.ctx.stroke();
    }
  }

  /**
   * Configura event listeners para detectar clicks en las fichas
   * NOTA: Este método probablemente no se usa en la implementación actual
   */
  setUpEventListeners() {
    const canvas = this.ctx.canvas;
    const self = this;

    // Listener de click en el canvas
    canvas.addEventListener("click", (e) => {
      const clickedFicha = self.findClickedFicha(e.layerX, e.layerY);
      if (clickedFicha != null) {
        // Dibujar círculo de selección alrededor de la ficha
        self.ctx.beginPath();
        self.ctx.arc(
          self.x + self.size / 2,
          self.y + self.size / 2,
          self.size / 3,
          0,
          Math.PI * 2
        );
        self.ctx.lineWidth = 15;
        self.ctx.lineCap = "round";
        self.ctx.strokeStyle = "#160404ff"; // Color oscuro
        self.ctx.stroke();
        self.ctx.closePath();
      }
    });
  }
}
