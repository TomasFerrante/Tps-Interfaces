class Gallito {
  static spriteSheetImage = null;
  static isImageLoaded = false;

  static preloadSpriteSheet() {
    if (Gallito.spriteSheetImage) return; // Ya está cargada
    
    Gallito.spriteSheetImage = new Image();
    Gallito.spriteSheetImage.src = '../assets/images/flappy/spritesheets/gallito-sprite.png';
    
    Gallito.spriteSheetImage.onload = () => {
      Gallito.isImageLoaded = true;
      console.log('Gallito sprite pre-cargado correctamente');
    };
    
    Gallito.spriteSheetImage.onerror = () => {
      console.error('Error al pre-cargar el sprite del gallito');
      Gallito.isImageLoaded = false;
    };
  }
  
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 300;  // Tamaño más grande
    this.height = 300;
    this.speed = -2; // Se mueve hacia la izquierda
    
    // Propiedades del sprite sheet
    this.spriteSheet = new Image();
    this.spriteSheet.src = '../assets/images/flappy/spritesheets/gallito-sprite.png';
    this.spriteLoaded = false;
    
    this.spriteSheet = Gallito.spriteSheetImage;
    this.spriteLoaded = Gallito.isImageLoaded;

    this.spriteSheet.onload = () => {
      this.spriteLoaded = true;
      console.log('Gallito sprite loaded successfully!');
    };
    
    this.spriteSheet.onerror = () => {
      console.error('Error loading gallito sprite sheet');
    };
    
    // Animación del sprite
    this.frameWidth = 188.5;  // Ancho de cada frame en el sprite sheet (1131/6 = 188.5)
    this.frameHeight = 220; // Alto de cada frame en el sprite sheet
    this.currentFrame = 0;
    this.totalFrames = 6;  // 6 frames en el sprite sheet
    this.frameDelay = 6;   // Frames antes de cambiar sprite
    this.frameCounter = 0;
    
    // Animación de aparición
    this.scale = 1; // Ya empieza al tamaño completo
    this.visible = true;
  }

  update() {
    // Movimiento horizontal
    this.x += this.speed;
    
    // Actualizar animación del sprite
    this.frameCounter++;
    if (this.frameCounter >= this.frameDelay) {
      this.frameCounter = 0;
      this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
    }
  }

  isOffScreen(canvasWidth) {
    return this.x + this.width < 0;
  }
}