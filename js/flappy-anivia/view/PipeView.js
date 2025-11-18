class PipeView {
  constructor(image, imageFlipped) {
    // this.x = x;
    // this.y = y;
    // this.width = width;
    // this.height = height;
    this.image = image;
    this.imageFlipped = imageFlipped;
  }

  draw() {
    const containerObjects = document.querySelector('.container-objects');

    const containerPipe = document.createElement('div');
    containerPipe.classList.add('container-pipe');

    const image = document.createElement('img')
    image.classList.add('pipe-image');
    const imageFlipped = document.createElement('img')
    imageFlipped.classList.add('pipe-image-flipped');
    
    image.src = this.image;
    imageFlipped.src = this.imageFlipped;

    containerPipe.appendChild(image);
    containerPipe.appendChild(imageFlipped);
    containerObjects.appendChild(containerPipe);
  }
}