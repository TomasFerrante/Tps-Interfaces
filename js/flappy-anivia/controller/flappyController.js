class FlappyController {
  constructor(pipe, pipeView) {
    this.pipe = pipe;
    this.pipeView = pipeView;
  }

  init() {
    this.pipeView.draw();
  }
}