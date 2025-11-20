let flappyController = null;
let pipeView = null;
let aniviaView = null;
let bonusView = null;
let gameRunning = false;
let gameStarted = false;
let gameOver = false;
let gameStartTime = 0;
let victoryScreenTime = 0;
let canRestartGame = false;

let image = "../assets/images/flappy/objects/roca3.png";
let coin = "../assets/images/flappy/spritesheets/coins.png";
let heart = "../assets/images/flappy/spritesheets/hearts.png";

function init() {
  const containerObjects = document.querySelector('.container-objects');

  pipeView = new PipeView(image);
  aniviaView = new AniviaView();
  bonusView = new BonusView();

  flappyController = new FlappyController(800, 550);
  
  showStartScreen();
  
  document.addEventListener('keydown', handleKeyDown);
  document.querySelector('.play-button')?.addEventListener('click', startGame);
}

function showStartScreen() {
  const containerObjects = document.querySelector('.container-objects');
  
  const startScreen = document.createElement('div');
  startScreen.id = 'start-screen';
  startScreen.classList.add('start-screen');
  
  startScreen.innerHTML = `
    <div class="start-screen-content">
      <h1>FLAPPY ANIVIA</h1>
      <p>Evita los obstáculos y recolecta monedas</p>
      
      <button class="play-button">▶ JUGAR AHORA</button>
      
      <div class="controls-hint">
        <p>Presiona <span class="key">ESPACIO</span> para volar</p>
        <p>O haz clic en el botón para comenzar</p>
      </div>
    </div>
  `;
  
  containerObjects.appendChild(startScreen);
  document.querySelector('.play-button').addEventListener('click', startGame);
}

function handleKeyDown(event) {
  if (!gameStarted && (event.code === 'Space' || event.code === 'Enter')) {
    event.preventDefault();
    startGame();
  }
  
  if (gameStarted && !gameOver && event.code === 'Space') {
    event.preventDefault();
    flappyController.jump();
  }
  
  // Victoria: Solo permitir reiniciar después de 2 segundos
  if (gameOver && canRestartGame && (event.code === 'Space' || event.code === 'Enter')) {
    event.preventDefault();
    location.reload();
  }
}

function startGame() {
  const startScreen = document.getElementById('start-screen');
  if (startScreen) {
    startScreen.remove();
  }
  
  gameStartTime = Date.now();
  gameStarted = true;
  gameRunning = true;
  gameOver = false;
  canRestartGame = false;
  
  flappyController.generatePipes();
  showHUD();
  gameLoop();
}

function showHUD() {
  const containerObjects = document.querySelector('.container-objects');
  
  const hud = document.createElement('div');
  hud.id = 'game-hud';
  hud.classList.add('game-hud');
  hud.innerHTML = `
    <div class="hud-score">
      <span class="score-label">PUNTUACIÓN:</span>
      <span class="score-value" id="score-display">0</span>
      <span class="score-max">/ 15</span>
    </div>
    <div class="hud-bonuses">
      <div class="hud-bonus-item">
        <span class="bonus-icon bonus-coin-icon">💰</span>
        <span class="bonus-value" id="coins-display">0</span>
      </div>
      <div class="hud-bonus-item">
        <span class="bonus-icon bonus-life-icon">❤️</span>
        <span class="bonus-value" id="lives-display">1</span>
      </div>
    </div>
  `;
  
  containerObjects.appendChild(hud);
}

function updateHUD() {
  const scoreDisplay = document.getElementById('score-display');
  const coinsDisplay = document.getElementById('coins-display');
  const livesDisplay = document.getElementById('lives-display');
  
  if (scoreDisplay) {
    scoreDisplay.textContent = flappyController.score;
  }
  if (coinsDisplay) {
    coinsDisplay.textContent = flappyController.coins;
  }
  if (livesDisplay) {
    livesDisplay.textContent = flappyController.lives;
  }
}

function gameLoop() {
  if (!gameRunning) return;

  flappyController.updatePipes();
  flappyController.updateBonuses();
  const isAlive = flappyController.updateAnivia();
  aniviaView.draw(flappyController.anivia);
  
  flappyController.checkScoring();
  flappyController.checkBonusCollision();
  updateHUD();
  
  const noCollision = flappyController.checkCollisions();
  
  if (!isAlive || !noCollision) {
    gameOver = true;
    gameRunning = false;
    showGameOverScreen();
    return;
  }

  if (flappyController.isVictory()) {
    gameOver = true;
    gameRunning = false;
    showVictoryScreen();
    return;
  }

  pipeView.draw(flappyController.pipes);
  bonusView.draw(flappyController.bonuses);
  
  requestAnimationFrame(gameLoop);
}

function showGameOverScreen() {
  const containerObjects = document.querySelector('.container-objects');
  
  const gameOverScreen = document.createElement('div');
  gameOverScreen.id = 'game-over-screen';
  gameOverScreen.classList.add('start-screen');
  
  gameOverScreen.innerHTML = `
    <div class="start-screen-content">
      <h1>GAME OVER</h1>
      <p>Puntuación: <span style="color: var(--Green);">${flappyController.score}</span>/15</p>
      <p>Monedas: <span style="color: var(--Orange);">💰 ${flappyController.coins}</span></p>
      
      <button class="play-button" onclick="location.reload()">↻ JUGAR DE NUEVO</button>
    </div>
  `;
  
  containerObjects.appendChild(gameOverScreen);
}

function showVictoryScreen() {
  const containerObjects = document.querySelector('.container-objects');
  
  const totalScore = flappyController.score;
  const totalCoins = flappyController.coins;
  const stars = totalScore === 15 ? '⭐⭐⭐' : totalScore >= 12 ? '⭐⭐' : '⭐';
  
  const victoryScreen = document.createElement('div');
  victoryScreen.id = 'victory-screen';
  victoryScreen.classList.add('start-screen');
  
  victoryScreen.innerHTML = `
    <div class="start-screen-content victory-content">
      <div class="victory-header">
        <div class="victory-champion-container">
          <img class="victory-champion-image" src="../assets/images/flappy/objects/gallito-campeon.png" alt="¡Gallito Campeón!" />
        </div>
        
        <div class="victory-info">
          <h1>¡VICTORIA!</h1>
          <div class="victory-stars">${stars}</div>
          <p class="victory-message">¡Lo lograste!</p>
        </div>
      </div>

      <div class="victory-stats-container">
        <div class="victory-stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-content">
            <div class="stat-label">PUNTUACIÓN</div>
            <div class="stat-value">${totalScore}<span class="stat-max">/15</span></div>
          </div>
        </div>

        <div class="victory-stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <div class="stat-label">MONEDAS</div>
            <div class="stat-value">${totalCoins}</div>
          </div>
        </div>

        <div class="victory-stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-content">
            <div class="stat-label">NIVEL</div>
            <div class="stat-value">${totalScore === 15 ? 'ÉPICO' : totalScore >= 12 ? 'AVANZADO' : 'NOVATO'}</div>
          </div>
        </div>
      </div>

      <div class="victory-restart-hint" id="restart-hint" style="display: none;">
        <p>Presiona <span class="key">ESPACIO</span> para jugar de nuevo</p>
      </div>
      
      <button class="play-button" onclick="location.reload()">↻ JUGAR DE NUEVO</button>
    </div>
  `;
  
  containerObjects.appendChild(victoryScreen);
  
  // Esperar 2 segundos antes de permitir reiniciar
  victoryScreenTime = Date.now();
  canRestartGame = false;
  
  setTimeout(() => {
    canRestartGame = true;
    const restartHint = document.getElementById('restart-hint');
    if (restartHint) {
      restartHint.style.display = 'block';
      restartHint.style.animation = 'fadeInUp 0.5s ease-out';
    }
  }, 2000);
}

function resetGame() {
  gameStarted = false;
  gameRunning = false;
  gameOver = false;
  canRestartGame = false;
  
  const containerObjects = document.querySelector('.container-objects');
  containerObjects.innerHTML = '';
  
  aniviaView.reset();
  bonusView.reset();
  
  flappyController.reset();
  showStartScreen();
}

document.addEventListener('DOMContentLoaded', init);