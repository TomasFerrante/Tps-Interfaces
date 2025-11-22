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
    
    // Efecto de parpadeo cuando está invulnerable
    if (anivia.shouldBlink()) {
      this.aniviaElement.style.opacity = '0.3';
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