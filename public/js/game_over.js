game.state.add('gameOver', {create:createGameOver, update:update});

function createGameOver() {
  game.background = game.add.sprite(0, 0, 'background');
  allReady = false;
  gameStarted = false;
  gameText = game.add.text(30, 30, "Click for new game", {fill: "#fff", });
}

function update() {
  game.background.events.onInputDown.add(location.reload());
}