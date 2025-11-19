class Anivia {
  constructor(x, y, canvasHeight) {
    this.x = x;
    this.y = y;
    
    // Dimensiones visuales (para mostrar en pantalla)
    this.visualWidth = 75;
    this.visualHeight = 80;
    
    // Dimensiones del hitbox
    this.width = 40;
    this.height = 35;
    
    // Offset del hitbox respecto a la posición visual (centra el hitbox en el pájaro)
    this.hitboxOffsetX = (this.visualWidth - this.width) / 2;  // 22.5
    this.hitboxOffsetY = (this.visualHeight - this.height) / 2; // 27.5
    
    this.canvasHeight = canvasHeight;
    this.velocity = 0;
    this.gravity = 0.6;
    this.jumpForce = -8;
    this.maxVelocity = 15;
  }

  update() {
    this.velocity += this.gravity;
    
    if (this.velocity > this.maxVelocity) {
      this.velocity = this.maxVelocity;
    }

    this.y += this.velocity;

    // Colisión con piso (usando hitbox)
    if (this.y + this.hitboxOffsetY + this.height > this.canvasHeight) {
      this.y = this.canvasHeight - this.hitboxOffsetY - this.height;
      return false;
    }

    // Colisión con techo (usando hitbox)
    if (this.y + this.hitboxOffsetY < 0) {
      this.y = -this.hitboxOffsetY;
      return false;
    }

    return true;
  }

  jump() {
    this.velocity = this.jumpForce;
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.velocity = 0;
  }

  // Método para obtener las coordenadas reales del hitbox
  getHitboxBounds() {
    return {
      x: this.x + this.hitboxOffsetX,
      y: this.y + this.hitboxOffsetY,
      width: this.width,
      height: this.height
    };
  }
}