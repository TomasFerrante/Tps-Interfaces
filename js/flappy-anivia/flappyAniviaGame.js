let flappyController = null;
let pipeView = null;
let aniviaView = null;
let bonusView = null;
let gallitoView = null;
let gameRunning = false;
let gameStarted = false;
let gameOver = false;
let gameStartTime = 0;
let victoryScreenTime = 0;
let canRestartGame = false;

// Audio
let backgroundMusic = null;
let coinSound = null;
let isMusicMuted = false;

let image = "../assets/images/flappy/objects/roca3.png";
let coin = "../assets/images/flappy/spritesheets/coins.png";
let heart = "../assets/images/flappy/spritesheets/hearts.png";

function init() {
  const containerObjects = document.querySelector('.container-objects');

  pipeView = new PipeView(image);
  aniviaView = new AniviaView();
  bonusView = new BonusView();
  gallitoView = new GallitoView();

  flappyController = new FlappyController(800, 550);
  
  // Inicializar audio
  initAudio();
  
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
      
      <button class="music-toggle" id="music-toggle" title="Activar/Desactivar música">
        <span class="material-symbols-outlined">volume_up</span>
      </button>
    </div>
  `;
  
  containerObjects.appendChild(startScreen);
  document.querySelector('.play-button').addEventListener('click', startGame);
  document.getElementById('music-toggle').addEventListener('click', toggleMusic);
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
  
  // Iniciar música de fondo
  playBackgroundMusic();
  
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
  flappyController.anivia.updateInvulnerability();
  aniviaView.draw(flappyController.anivia);
  
  flappyController.checkScoring();
  flappyController.checkBonusCollision();
  updateHUD();
  
  // Spawn gallito cuando se alcance la puntuación máxima
  flappyController.spawnGallito();
  flappyController.updateGallito();
  
  // Dibujar gallito si existe
  if (flappyController.gallito) {
    gallitoView.draw(flappyController.gallito);
  }
  
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
  
  stopBackgroundMusic();
  
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
  
  stopBackgroundMusic();
  
  const totalScore = flappyController.score;
  const totalCoins = flappyController.coins;
  
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
  gallitoView.reset();
  
  flappyController.reset();
  showStartScreen();
  
  // Restaurar el estado del botón de música
  setTimeout(() => {
    const musicButton = document.getElementById('music-toggle');
    if (musicButton && isMusicMuted) {
      musicButton.innerHTML = '<span class="material-symbols-outlined">volume_off</span>';
      musicButton.classList.add('muted');
    }
  }, 0);
}

// Funciones de audio
function initAudio() {
  // Música de fondo - W&W OIIA OIIA (0:28 a 0:46)
  backgroundMusic = new Audio('../assets/W&W - OIIA OIIA (Spinning Cat) - W&W.mp3');
  backgroundMusic.loop = true;
  backgroundMusic.volume = 0.3;
  
  // Efecto de moneda (0:00 a 0:02)
  coinSound = new Audio('../assets/Super Mario Bros. - Coin Sound Effect - IltubodiFlegias.mp3');
  coinSound.volume = 0.5;
}

function playBackgroundMusic() {
  if (!isMusicMuted && backgroundMusic) {
    backgroundMusic.currentTime = 28; // Empezar en 0:28
    backgroundMusic.play().catch(err => console.log('Error playing music:', err));
    
    // Detener en 0:48 (después de 20 segundos) y reiniciar
    setTimeout(() => {
      if (gameRunning && backgroundMusic) {
        backgroundMusic.currentTime = 28;
      }
    }, 20000);
  }
}

function stopBackgroundMusic() {
  if (backgroundMusic) {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 28;
  }
}

function playCoinSound() {
  if (coinSound) {
    coinSound.currentTime = 0;
    coinSound.play().catch(err => console.log('Error playing coin sound:', err));
    
    // Detener en 0:02
    setTimeout(() => {
      if (coinSound) {
        coinSound.pause();
        coinSound.currentTime = 0;
      }
    }, 2000);
  }
}

function toggleMusic() {
  isMusicMuted = !isMusicMuted;
  const musicButton = document.getElementById('music-toggle');
  
  if (isMusicMuted) {
    stopBackgroundMusic();
    if (musicButton) {
      musicButton.innerHTML = '<span class="material-symbols-outlined">volume_off</span>';
      musicButton.classList.add('muted');
    }
  } else {
    if (gameStarted && gameRunning) {
      playBackgroundMusic();
    }
    if (musicButton) {
      musicButton.innerHTML = '<span class="material-symbols-outlined">volume_up</span>';
      musicButton.classList.remove('muted');
    }
  }
}

document.addEventListener('DOMContentLoaded', init);