class Pipe {
  static nextId = 0;

  constructor(x, gapSize = 180, minGapPosition = 80, maxGapPosition = 350) {
    this.id = Pipe.nextId++;
    this.x = x;
    this.width = 60;
    this.gapSize = gapSize;
    this.gapY = this.randomizeGapPosition(minGapPosition, maxGapPosition);
    this.speed = 5;
    this.scored = false;
  }

  randomizeGapPosition(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  update() {
    this.x -= this.speed;
  }

  isOffScreen(canvasWidth) {
    return this.x + this.width < 0;
  }

  collidesWith(anivia) {
    // Usar el hitbox real del pájaro
    const hitbox = anivia.getHitboxBounds();
    
    if (hitbox.x + hitbox.width > this.x && hitbox.x < this.x + this.width) {
      // Colisiona con tubería superior
      if (hitbox.y < this.gapY) return true;
      // Colisiona con tubería inferior
      if (hitbox.y + hitbox.height > this.gapY + this.gapSize) return true;
    }
    return false;
  }
}