class FlappyController {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.pipes = [];
    this.bonuses = [];
    this.pipeSpacing = 350;
    this.nextPipeX = this.canvasWidth;
    this.score = 0;
    this.maxScore = 15;
    this.gallitoScore = 13; // El gallito aparece cuando llegas a 13 puntos
    this.coins = 0;
    this.lives = 1;
    this.anivia = new Anivia(100, canvasHeight / 2, canvasHeight);
    this.gallito = null;
    this.gallitoSpawned = false;
  }

  generatePipes() {
    let x = this.canvasWidth;
    for (let i = 0; i < 15; i++) {
      const pipe = new Pipe(x, 180);
      this.pipes.push(pipe);
      
      // Generar bonus para esta tubería
      this.generateBonusForPipe(pipe, x);
      
      // Generar bonus ENTRE tuberías (60% de probabilidad)
      if (i < 14 && Math.random() > 0.4) {
        this.generateBonusBetweenPipes(x);
      }
      
      x += this.pipeSpacing;
    }
    this.nextPipeX = x;
  }

  generateBonusForPipe(pipe, x) {
    // 40% de probabilidad de generar un bonus EN la tubería
    if (Math.random() > 0.4) return;

    const bonusX = x - 30;
    const bonusY = pipe.gapY + (pipe.gapSize / 2) - 28.5;
    const bonusType = Math.random() > 0.2 ? Bonus.TYPES.COIN : Bonus.TYPES.LIFE;
    
    this.bonuses.push(new Bonus(bonusX, bonusY, bonusType));
  }

  generateBonusBetweenPipes(currentPipeX) {
    // Posición X: esparcido entre tuberías
    const bonusX = currentPipeX + this.pipeSpacing * 0.5;
    
    // Posición Y: COMPLETAMENTE ALEATORIA en la pantalla
    // Puede estar en cualquier lugar, no solo en extremos
    const bonusY = Math.random() * (this.canvasHeight - 100) + 50; // Entre 50 y canvasHeight-50

    const bonusType = Math.random() > 0.2 ? Bonus.TYPES.COIN : Bonus.TYPES.LIFE;
    
    this.bonuses.push(new Bonus(bonusX, bonusY, bonusType));
  }

  updatePipes() {
    this.pipes.forEach(pipe => pipe.update());

    // Generar nuevas tuberías Y sus bonuses
    while (this.nextPipeX < this.canvasWidth + 200) {
      const newPipe = new Pipe(this.nextPipeX);
      this.pipes.push(newPipe);
      
      // Generar bonus EN la tubería
      this.generateBonusForPipe(newPipe, this.nextPipeX);
      
      // Generar bonus ENTRE tuberías con probabilidad
      if (this.pipes.length > 1 && Math.random() > 0.4) {
        const prevPipeX = this.nextPipeX - this.pipeSpacing;
        this.generateBonusBetweenPipes(prevPipeX);
      }
      
      this.nextPipeX += this.pipeSpacing;
    }

    // Limpiar tuberías fuera de pantalla
    this.pipes = this.pipes.filter(pipe => !pipe.isOffScreen(this.canvasWidth));
  }

  updateBonuses() {
    this.bonuses.forEach(bonus => bonus.update());
    this.bonuses = this.bonuses.filter(bonus => !bonus.isOffScreen(this.canvasWidth));
  }

  updateAnivia() {
    return this.anivia.update();
  }

  updateGallito() {
    if (this.gallito) {
      this.gallito.update();
    }
  }

  spawnGallito() {
    if (!this.gallitoSpawned && this.score >= this.gallitoScore) {
      // Aparece en el lado derecho de la pantalla cuando llegas a 13 puntos
      const gallitoX = this.canvasWidth + 200;
      const gallitoY = this.canvasHeight / 2 - 75; // Centrado verticalmente
      
      this.gallito = new Gallito(gallitoX, gallitoY);
      this.gallitoSpawned = true;
      console.log('Gallito spawned at:', gallitoX, gallitoY);
    }
  }

  checkCollisions() {
    // Si está invulnerable, no puede recibir daño
    if (this.anivia.isInvulnerable) {
      return true;
    }

    for (let pipe of this.pipes) {
      if (pipe.collidesWith(this.anivia)) {
        // Si tiene vidas extra, consume una vida
        if (this.lives > 1) {
          this.lives--;
          this.anivia.activateInvulnerability();
          return true; // Continúa el juego
        }
        // Si no tiene vidas extra, game over
        return false;
      }
    }
    return true;
  }

  checkBonusCollision() {
    for (let bonus of this.bonuses) {
      if (bonus.collidesWith(this.anivia.x, this.anivia.y, this.anivia.width, this.anivia.height)) {
        if (bonus.type === Bonus.TYPES.COIN) {
          this.coins++;
          // Reproducir sonido de moneda
          if (typeof playCoinSound === 'function') {
            playCoinSound();
          }
        } else if (bonus.type === Bonus.TYPES.LIFE) {
          this.lives++;
        }
        bonus.scored = true;
      }
    }
    this.bonuses = this.bonuses.filter(bonus => !bonus.scored);
  }

  checkScoring() {
    this.pipes.forEach(pipe => {
      if (!pipe.scored && this.anivia.x > pipe.x + pipe.width) {
        pipe.scored = true;
        this.score++;
      }
    });
  }

  isVictory() {
    return this.score >= this.maxScore;
  }

  jump() {
    this.anivia.jump();
  }

  reset() {
    this.pipes = [];
    this.bonuses = [];
    this.nextPipeX = this.canvasWidth;
    this.score = 0;
    this.coins = 0;
    this.lives = 1;
    this.anivia.reset(100, this.canvasHeight / 2);
    this.gallito = null;
    this.gallitoSpawned = false;
  }
}
