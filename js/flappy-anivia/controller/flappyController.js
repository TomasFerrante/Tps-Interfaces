class FlappyController {
  constructor(pipe, pipeView, coinView, heartView) {
    this.pipe = pipe;
    this.pipeView = pipeView;
    this.coinView = coinView;
    this.heartView = heartView;
  }

  init() {
    this.pipeView.draw();
    this.heartView.draw();
    //this.coinView.draw();
  }
}