game.state.add('playgame', { preload: preload, create:create, update:update });


var platformX;

function preload () {
  game.load.image( 'platform', '/assets/basic_platform.png');
  game.load.image( 'player', '/assets/player.png');
  game.load.image( 'background', '/assets/background.png');
}

function create () {
  game.physics.startSystem(Phaser.Physics.ARCADE);

  background = game.add.sprite(0, 0, 'background');
  player = game.add.sprite(250, 300, 'player');
  platform = game.add.sprite(250, 400, 'platform');


  game.physics.enable(player, Phaser.Physics.ARCADE);
  player.body.gravity.y = 200;
  game.physics.enable(platform, Phaser.Physics.ARCADE);
  platform.body.immovable = true;

  cursors = game.input.keyboard.createCursorKeys();

  background.inputEnabled = true;
  background.events.onInputDown.add(setPlatform, this);

}

function update () {

  game.physics.arcade.collide(player, platform);
  game.physics.arcade.collide(player, platformX)

  if (cursors.left.isDown) {
    player.body.velocity.x = -100;
  } else if (cursors.right.isDown) {
    player.body.velocity.x = 100;
  } else {
    player.body.velocity.x = 0;
  }
  if (player.body.y > 601) {
    player.body.y = 0;
  }
  if (cursors.up.isDown && player.body.touching.down) {
    player.body.velocity.y = -200;
  } else if (cursors.down.isDown) {
    player.body.velocity.y = 100;
  }

}

function setPlatform () {
  platformX = game.add.sprite(game.input.x, game.input.y, 'platform');
  game.physics.enable(platformX, Phaser.Physics.ARCADE);
  platformX.body.immovable = true;
}

