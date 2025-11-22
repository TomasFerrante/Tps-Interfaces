class GallitoView {
  constructor() {
    this.containerObjects = document.querySelector('.container-objects');
    this.gallitoElements = [];
  }

  draw(gallito) {
    if (!gallito) return;
    
    // Buscar o crear elemento del gallito
    let gallitoElement = this.gallitoElements[0];
    
    if (!gallitoElement) {
      gallitoElement = document.createElement('canvas');
      gallitoElement.classList.add('gallito');
      gallitoElement.width = gallito.width;
      gallitoElement.height = gallito.height;
      gallitoElement.style.position = 'absolute';
      gallitoElement.style.zIndex = '15';
      this.containerObjects.appendChild(gallitoElement);
      this.gallitoElements.push(gallitoElement);
      console.log('Gallito element created');
    }
    
    // Actualizar posición
    gallitoElement.style.left = `${gallito.x}px`;
    gallitoElement.style.top = `${gallito.y}px`;
    
    // Dibujar el frame actual del sprite sheet en el canvas
    const ctx = gallitoElement.getContext('2d');
    ctx.clearRect(0, 0, gallito.width, gallito.height);
    
    if (gallito.spriteLoaded) {
      // Calcular la posición del frame en el sprite sheet
      const frameX = gallito.currentFrame * gallito.frameWidth;
      const frameY = 0; // Asumiendo una sola fila de frames
      
      // Dibujar el frame escalado al tamaño del gallito
      ctx.drawImage(
        gallito.spriteSheet,
        frameX, frameY,
        gallito.frameWidth, gallito.frameHeight,
        0, 0,
        gallito.width, gallito.height
      );
    } else {
      // Fallback: dibujar un rectángulo mientras carga el sprite
      ctx.fillStyle = 'yellow';
      ctx.fillRect(0, 0, gallito.width, gallito.height);
      ctx.fillStyle = 'black';
      ctx.font = '20px Arial';
      ctx.fillText('GALLITO', 50, 100);
    }
  }

  reset() {
    this.gallitoElements.forEach(element => {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    this.gallitoElements = [];
  }
}