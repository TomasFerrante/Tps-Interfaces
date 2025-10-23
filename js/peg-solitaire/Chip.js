class Chip {
  constructor(x, y, size, ctx, radius) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.selected = false;
    this.ctx = ctx;
    this.radius = radius;
    this.fichas = [];
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.fillStyle = this.selected ? "#444" : "#000000b3";
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
    canvas.addEventListener("click", (e) => {
      let clickedFicha = findClickedFicha(e.layerX, e.layerY);
      if (clickedFicha != null) {
        this.ctx.beginPath();
        this.ctx.arc(
          this.x + this.size / 2,
          this.y + this.size / 2,
          this.size / 3,
          0,
          Math.PI * 2
        );
        this.ctx.lineWidth = 15;
        this.ctx.lineCap = "round";
        this.ctx.strokeStyle = "#160404ff";
        this.ctx.stroke();
        this.ctx.closePath();
      }

      function findClickedFicha(x, y) {
        for (let i = 0; i < this.fichas.length; i++) {
          let ficha = this.fichas[i];
          if (ficha.isPointInside(x, y)) {
            return ficha;
          }
        }
      }
    });
  }

  isPointInside(px, py) {
    let _x = this.x - px;
    let _y = this.y - py;
    return Math.sqrt(_x * _x + _y * _y) <= this.radius;
  }

  addFicha(ficha) {
    this.fichas.push(ficha);
  }
}
