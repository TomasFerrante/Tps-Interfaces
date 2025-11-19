class BonusView {
  constructor() {
    this.container = document.querySelector('.container-objects');
    this.bonusElements = new Map();
  }

  draw(bonuses) {
    if (!this.container) return;

    bonuses.forEach(bonus => {
      if (!this.bonusElements.has(bonus.id)) {
        this.createBonusElement(bonus);
      }

      const element = this.bonusElements.get(bonus.id);
      if (element) {
        element.style.left = bonus.x + 'px';
        element.style.top = bonus.y + 'px';
        // Rotación en el eje Y (como dando vuelta horizontal)
        element.style.transform = `rotateY(${bonus.rotation}deg)`;
      }
    });

    const bonusIds = bonuses.map(b => b.id);
    this.bonusElements.forEach((element, bonusId) => {
      if (!bonusIds.includes(bonusId)) {
        element.remove();
        this.bonusElements.delete(bonusId);
      }
    });
  }

  createBonusElement(bonus) {
    const bonusElement = document.createElement('div');
    bonusElement.classList.add('bonus-sprite');
    bonusElement.style.left = bonus.x + 'px';
    bonusElement.style.top = bonus.y + 'px';
    bonusElement.style.width = bonus.width + 'px';
    bonusElement.style.height = bonus.height + 'px';

    if (bonus.type === Bonus.TYPES.COIN) {
      bonusElement.classList.add('bonus-coin');
      bonusElement.style.backgroundImage = `url('../assets/images/flappy/spritesheets/coins.png')`;
      bonusElement.style.backgroundSize = '288px 57px';
      bonusElement.style.animation = 'Spin 1.5s steps(6) infinite';
    } else if (bonus.type === Bonus.TYPES.LIFE) {
      bonusElement.classList.add('bonus-life');
      bonusElement.style.backgroundImage = `url('../assets/images/flappy/spritesheets/hearts.png')`;
      bonusElement.style.backgroundSize = '288px 57px';
      bonusElement.style.animation = 'Spin 1.5s steps(6) infinite';
    }

    this.container.appendChild(bonusElement);
    this.bonusElements.set(bonus.id, bonusElement);
  }

  reset() {
    this.bonusElements.forEach(element => element.remove());
    this.bonusElements.clear();
  }
}