class AniviaView {
  constructor() {
    this.container = document.querySelector('.container-objects');
    this.aniviaElement = null;
  }

  draw(anivia) {
    if (!this.aniviaElement) {
      this.aniviaElement = document.createElement('div');
      this.aniviaElement.classList.add('anivia-sprite');
      this.container.appendChild(this.aniviaElement);
    }

    this.aniviaElement.style.top = anivia.y + 'px';
    this.aniviaElement.style.left = anivia.x + 'px';
    
    // Manejar estados de colisión y muerte
    if (anivia.isColliding) {
      this.aniviaElement.classList.add('collision');
      
      // Si ya pasó el tiempo de espera y está cayendo, fijar en el 5to frame
      if (anivia.isDead) {
        this.aniviaElement.classList.add('dead');
      }
    } else {
      this.aniviaElement.classList.remove('collision', 'dead');
    }
    
    // Efecto de parpadeo cuando está invulnerable (solo si no está en colisión)
    if (!anivia.isColliding) {
      if (anivia.shouldBlink()) {
        this.aniviaElement.style.opacity = '0.3';
      } else {
        this.aniviaElement.style.opacity = '1';
      }
    } else {
      this.aniviaElement.style.opacity = '1';
    }
  }

  reset() {
    if (this.aniviaElement) {
      this.aniviaElement.remove();
      this.aniviaElement = null;
    }
  }
}