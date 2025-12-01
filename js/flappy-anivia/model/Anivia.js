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
    this.gravity = 0.3;
    this.jumpForce = -6;
    this.maxVelocity = 15;
    this.deathGravity = 0.15; // Gravedad más lenta cuando muere
    this.deathMaxVelocity = 5; // Velocidad máxima de caída más lenta
    
    // Sistema de invulnerabilidad
    this.isInvulnerable = false;
    this.invulnerabilityTime = 2000; // 2 segundos de invulnerabilidad
    this.invulnerabilityStart = 0;
    this.blinkInterval = 100; // Parpadeo cada 100ms
    
    // Estados de colisión y muerte
    this.isDead = false;
    this.isColliding = false;
    this.collisionStartTime = 0;
    this.fallDelay = 500; // Tiempo que tarda en empezar a caer después de la colisión (ms)
  }

  update() {
    // Si está en estado de colisión pero aún no debe caer, mantener posición
    if (this.isColliding && !this.isDead) {
      const elapsedTime = Date.now() - this.collisionStartTime;
      if (elapsedTime < this.fallDelay) {
        return true; // No aplicar física todavía
      } else {
        this.isDead = true; // Activar la caída
      }
    }
    
    // Si está muerto, aplicar gravedad para la caída
    if (this.isDead) {
      this.velocity += this.deathGravity; // Usar gravedad más lenta
      
      if (this.velocity > this.deathMaxVelocity) {
        this.velocity = this.deathMaxVelocity; // Limitar velocidad de caída
      }

      this.y += this.velocity;

      // Colisión con piso (usando hitbox)
      if (this.y + this.hitboxOffsetY + this.height >= this.canvasHeight) {
        this.y = this.canvasHeight - this.hitboxOffsetY - this.height;
        return true; // Mantener true para no terminar el juego hasta que se complete la animación
      }
      
      return true;
    }
    
    // Física normal cuando está vivo
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
    // No permitir saltar si está en estado de colisión o muerto
    if (this.isColliding || this.isDead) return;
    this.velocity = this.jumpForce;
  }
  
  triggerCollision() {
    this.isColliding = true;
    this.collisionStartTime = Date.now();
    this.velocity = 0; // Detener el movimiento inmediatamente
  }

  activateInvulnerability() {
    this.isInvulnerable = true;
    this.invulnerabilityStart = Date.now();
  }

  updateInvulnerability() {
    if (this.isInvulnerable) {
      const elapsed = Date.now() - this.invulnerabilityStart;
      if (elapsed >= this.invulnerabilityTime) {
        this.isInvulnerable = false;
      }
    }
  }

  shouldBlink() {
    if (!this.isInvulnerable) return false;
    const elapsed = Date.now() - this.invulnerabilityStart;
    return Math.floor(elapsed / this.blinkInterval) % 2 === 0;
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.velocity = 0;
    this.isInvulnerable = false;
    this.invulnerabilityStart = 0;
    this.isDead = false;
    this.isColliding = false;
    this.collisionStartTime = 0;
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