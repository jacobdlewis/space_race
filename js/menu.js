game.state.add('menu', { preload:preload, create:create } );
game.state.start('menu');

function preload() {
  game.load.image( 'menu', '/assets/start_button.png')
}

function create() {
  menu = game.add.sprite(0, 0, 'menu');
  menu.inputEnabled = true;
  menu.events.onInputDown.add(startGame, this);
}

function startGame () {
  game.state.start('playgame');
}