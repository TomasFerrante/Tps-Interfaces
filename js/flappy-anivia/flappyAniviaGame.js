let flappyController = null;
let pipeView = null;
let aniviaView = null;
let bonusView = null;
let gameRunning = false;
let gameStarted = false;
let gameOver = false;
let gameStartTime = 0;

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
  
  if (gameOver) {
    return;
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
      <h1>¡VICTORIA!</h1>
      
      <div class="victory-stars">${stars}</div>
      
      <p class="victory-message">
        ¡Completaste todos los obstáculos!
      </p>
      
      <div class="victory-stat">
        <div class="victory-stat-label">Puntuación Final</div>
        <div class="victory-stat-value">${totalScore}<span style="font-size: 28px; color: var(--Green);">/15</span></div>
      </div>

      <div class="victory-stat">
        <div class="victory-stat-label">Monedas Recolectadas</div>
        <div class="victory-stat-value" style="color: var(--Orange);">💰 ${totalCoins}</div>
      </div>
      
      <button class="play-button" onclick="location.reload()">↻ JUGAR DE NUEVO</button>
    </div>
  `;
  
  containerObjects.appendChild(victoryScreen);
}

function resetGame() {
  gameStarted = false;
  gameRunning = false;
  gameOver = false;
  
  const containerObjects = document.querySelector('.container-objects');
  containerObjects.innerHTML = '';
  
  aniviaView.reset();
  bonusView.reset();
  
  flappyController.reset();
  showStartScreen();
}

document.addEventListener('DOMContentLoaded', init);