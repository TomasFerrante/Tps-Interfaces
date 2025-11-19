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
  }

  reset() {
    if (this.aniviaElement) {
      this.aniviaElement.remove();
      this.aniviaElement = null;
    }
  }
}