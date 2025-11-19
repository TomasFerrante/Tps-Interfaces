class BonusView {
  constructor(image) {
    this.image = image;
  }

  draw() {
    const containerObjects = document.querySelector('.container-objects');

    const containerBonus = document.createElement('div');
    containerBonus.classList.add('container-bonus');

    containerBonus.style.backgroundImage = `url('${this.image}')`;

    containerObjects.appendChild(containerBonus);
  }
}