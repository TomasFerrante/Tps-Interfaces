
let flappyController = null;
let pipe = null;
let pipeView = null;
let coinView = null;
let heartView = null;

let image = "../assets/images/flappy/objects/columna.png";
let coin = "../assets/images/flappy/spritesheets/coins.png";
let heart = "../assets/images/flappy/spritesheets/hearts.png";

function init() {
  pipe = new Pipe();
  pipeView = new PipeView(image, image);
  //coinView = new BonusView(coin);
  heartView = new BonusView(heart);

  flappyController = new FlappyController(pipe, pipeView, coinView, heartView);
  flappyController.init();
}

init();