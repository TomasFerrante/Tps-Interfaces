
let flappyController = null;
let pipe = null;
let pipeView = null;
let image = "../assets/images/flappy/objects/cactus.png";

function init() {
  pipe = new Pipe();
  pipeView = new PipeView(image, image);

  flappyController = new FlappyController(pipe, pipeView);
  flappyController.init();
}

init();