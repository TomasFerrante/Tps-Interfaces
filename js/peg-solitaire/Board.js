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
    const initialBoard = [
      [-1, -1, 1, 1, 1, -1, -1],
      [-1, -1, 1, 1, 1, -1, -1],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 0, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [-1, -1, 1, 1, 1, -1, -1],
      [-1, -1, 1, 1, 1, -1, -1],
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
    const img = new Image();
    img.src = "../../assets/images/grietadelinvocador.webp";
    img.onload = () => {
      this.pattern = this.ctx.createPattern(img, "repeat");
      if (callback) callback();
    };
  }

  draw() {
    for (let row = 0; row < this.cells.length; row++) {
      for (let col = 0; col < this.cells[row].length; col++) {
        this.cells[row][col].draw(this.pattern);
      }
    }
  }

  setColor(color) {
    this.pattern = color;
  }
}
