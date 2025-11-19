class PipeView {
  constructor(pipeImage) {
    this.pipeImage = pipeImage;
    this.container = document.querySelector('.container-objects');
    this.pipeElements = new Map();
  }

  draw(pipes) {
    if (!this.container) return;

    pipes.forEach(pipe => {
      if (!this.pipeElements.has(pipe.id)) {
        this.createPipeElement(pipe);
      }

      const element = this.pipeElements.get(pipe.id);
      if (element) {
        element.style.left = pipe.x + 'px';
      }
    });

    const pipeIds = pipes.map(p => p.id);
    this.pipeElements.forEach((element, pipeId) => {
      if (!pipeIds.includes(pipeId)) {
        element.remove();
        this.pipeElements.delete(pipeId);
      }
    });
  }

  createPipeElement(pipe) {
    const containerPipe = document.createElement('div');
    containerPipe.classList.add('container-pipe');
    containerPipe.style.left = pipe.x + 'px';
    containerPipe.style.top = '0px';
    containerPipe.style.width = pipe.width + 'px';

    const topPipe = document.createElement('img');
    topPipe.src = this.pipeImage;
    topPipe.style.height = pipe.gapY + 'px';
    topPipe.style.width = '100%';
    topPipe.style.display = 'block';
    topPipe.style.objectFit = 'cover';
    topPipe.style.transform = 'scaleY(-1)';

    const gap = document.createElement('div');
    gap.style.height = pipe.gapSize + 'px';
    gap.style.width = '100%';

    const bottomPipe = document.createElement('img');
    bottomPipe.src = this.pipeImage;
    bottomPipe.style.height = (550 - pipe.gapY - pipe.gapSize) + 'px';
    bottomPipe.style.width = '100%';
    bottomPipe.style.display = 'block';
    bottomPipe.style.objectFit = 'cover';

    containerPipe.appendChild(topPipe);
    containerPipe.appendChild(gap);
    containerPipe.appendChild(bottomPipe);

    this.container.appendChild(containerPipe);
    this.pipeElements.set(pipe.id, containerPipe);
  }
}