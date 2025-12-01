class Bonus {
  static nextId = 0;
  static TYPES = {
    COIN: 'coin',
    LIFE: 'life'
  };

  constructor(x, y, type = Bonus.TYPES.COIN) {
    this.id = Bonus.nextId++;
    this.x = x;
    this.y = y;
    this.width = 48;
    this.height = 57;
    this.type = type;
    this.speed = 3;
    this.scored = false;
    this.rotation = 0;
  }

  update() {
    this.x -= this.speed;
    this.rotation += 3;
    if (this.rotation >= 360) {
      this.rotation = 0;
    }
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }

  collidesWith(birdX, birdY, birdWidth, birdHeight) {
    return (
      birdX + birdWidth > this.x &&
      birdX < this.x + this.width &&
      birdY + birdHeight > this.y &&
      birdY < this.y + this.height
    );
  }
}