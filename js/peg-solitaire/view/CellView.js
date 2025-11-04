// ========================================================================================
// CLASE CellView - Vista de celda individual (EN DESUSO)
// NOTA: Esta clase no se utiliza activamente. BoardView.js maneja todo el renderizado.
// Se mantiene por compatibilidad con versiones anteriores del código.
// ========================================================================================

class CellView {
  /**
   * Constructor vacío - clase en desuso
   */
  constructor() {}

  /**
   * Dibuja una celda individual con efectos visuales
   * @param {string|CanvasPattern} pattern - Patrón o color de fondo
   */
  draw(pattern) {
    // Solo dibujar si la celda es válida (no -1)
    if (this.value !== -1) {
      // Dibujar fondo de la celda con patrón o color
      this.ctx.fillStyle = pattern || "#2a1a4a";
      this.ctx.fillRect(this.x, this.y, this.size, this.size);

      // Efecto de bisel en la celda (bordes 3D)
      this.drawCellBevel();

      // Dibujar el espacio para la ficha (círculo con efecto 3D)
      this.drawChipSocket();

      // Si hay ficha, dibujarla con efectos
      if (this.ficha) {
        this.ficha.draw();
      }
    }
  }

  /**
   * Dibuja efecto de bisel (borde 3D) en la celda
   * Crea sombras y brillos para dar profundidad visual
   */
  drawCellBevel() {
    // Sombra interna superior izquierda (oscura) - efecto de profundidad
    const darkGradient = this.ctx.createLinearGradient(
      this.x,
      this.y,
      this.x + this.size / 4,
      this.y + this.size / 4
    );
    darkGradient.addColorStop(0, "rgba(0, 0, 0, 0.3)"); // Oscuro
    darkGradient.addColorStop(1, "transparent"); // Transparente
    this.ctx.fillStyle = darkGradient;
    this.ctx.fillRect(this.x, this.y, this.size / 4, this.size / 4);

    // Brillo inferior derecha (claro) - efecto de elevación
    const lightGradient = this.ctx.createLinearGradient(
      this.x + this.size,
      this.y + this.size,
      this.x + (this.size * 3) / 4,
      this.y + (this.size * 3) / 4
    );
    lightGradient.addColorStop(0, "rgba(255, 255, 255, 0.2)"); // Brillo
    lightGradient.addColorStop(1, "transparent"); // Transparente
    this.ctx.fillStyle = lightGradient;
    this.ctx.fillRect(
      this.x + (this.size * 3) / 4,
      this.y + (this.size * 3) / 4,
      this.size / 4,
      this.size / 4
    );

    // Borde de la celda con gradiente sutil morado
    const borderGradient = this.ctx.createLinearGradient(
      this.x,
      this.y,
      this.x,
      this.y + this.size
    );
    borderGradient.addColorStop(0, "rgba(138, 56, 245, 0.3)"); // Morado arriba
    borderGradient.addColorStop(0.5, "rgba(138, 56, 245, 0.1)"); // Morado medio
    borderGradient.addColorStop(1, "rgba(138, 56, 245, 0.3)"); // Morado abajo
    this.ctx.strokeStyle = borderGradient;
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(this.x, this.y, this.size, this.size);
  }

  /**
   * Dibuja el espacio circular donde va la ficha (socket/hueco)
   * Crea efecto de profundidad para simular un agujero 3D
   */
  drawChipSocket() {
    const centerX = this.x + this.size / 2; // Centro X de la celda
    const centerY = this.y + this.size / 2; // Centro Y de la celda
    const radius = this.size / 3; // Radio del círculo

    // Sombra del agujero (efecto hundido)
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    this.ctx.fill();

    // Gradiente radial para dar profundidad al agujero
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
      socketGradient.addColorStop(0, "rgba(138, 56, 245, 0.2)");
      socketGradient.addColorStop(0.7, "rgba(86, 3, 173, 0.3)");
      socketGradient.addColorStop(1, "rgba(16, 5, 39, 0.5)");
    } else {
      // Si está vacío, más oscuro para parecer profundo
      socketGradient.addColorStop(0, "rgba(16, 5, 39, 0.8)");
      socketGradient.addColorStop(0.7, "rgba(0, 0, 0, 0.6)");
      socketGradient.addColorStop(1, "rgba(0, 0, 0, 0.9)");
    }

    this.ctx.fillStyle = socketGradient;
    this.ctx.fill();

    // Borde del agujero con brillo sutil
    this.ctx.strokeStyle = this.ficha
      ? "rgba(247, 183, 49, 0.3)" // Dorado si hay ficha
      : "rgba(138, 56, 245, 0.2)"; // Morado si está vacío
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.restore();
  }
}
