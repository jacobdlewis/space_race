
var platformX;
var myId=0;
var ready = false;
var nextPlatformTimer = 0;
var gameStarted = false;
var eurecaServer;
var eClient;
var created = false;

var eurecaClientSetupGame = function() {
    eClient = eurecaClient;
    console.log("client",eClient);
    if(!created){
      createGame();
    }
    //methods defined under "exports" namespace become available in the server side

    //updates the state in the playerList of any player that has changed
    eurecaClient.exports.updateState = function(id, state){
      if (playerList[id])  {
          playerList[id].cursor = state;
          playerList[id].player.x = state.x;
          playerList[id].player.y = state.y;
          playerList[id].update();
      }
    }
}

game.state.add('playgame', { preload: preload, create:eurecaClientSetupGame, update:update });

function preload () {
  game.load.image( 'platform', '/assets/basic_platform.png');
  game.load.image( 'player', '/assets/player.png');
  game.load.image( 'background', '/assets/background.png');
}

function createGame () {
  eurecaServer.playerHandshake();
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.world.setBounds(0, 0, 320, 9000);

  game.bg = game.add.tileSprite(0, 0, 320, 9000, 'background');
  player = game.add.sprite(130, 8800, 'player');
  platform = game.add.sprite(110, 8850, 'platform');


  game.physics.enable(player, Phaser.Physics.ARCADE);
  player.body.gravity.y = 200;
  game.physics.enable(platform, Phaser.Physics.ARCADE);
  platform.body.immovable = true;

  cursors = game.input.keyboard.createCursorKeys();

  game.bg.inputEnabled = true;
  game.bg.events.onInputDown.add(setPlatform, this);

  game.cameraLastX = game.camera.x;
  game.cameraLastY = game.camera.y;

  game.camera.y = 9000;

  created = true;

}

function update () {

  if(created){

    game.physics.arcade.collide(player, platform);
    game.physics.arcade.collide(player, platformX)

    if (cursors.left.isDown) {
      player.body.velocity.x = -100;
    } else if (cursors.right.isDown) {
      player.body.velocity.x = 200;
    } else {
      player.body.velocity.x = 0;
    }

    if (cursors.up.isDown && player.body.touching.down) {
      player.body.velocity.y = -300;
      gameStarted = true;
    }

    if(game.camera.y !== game.cameraLastY) {
      game.bg.y -= 0.4 * (game.cameraLastY - game.camera.y);
      game.cameraLastY = game.camera.y;
    }

    if (gameStarted ===true) {
      game.camera.y -= .05;
    }

  }
}

function setPlatform () {
  var positionY = (game.world.y * -1) + game.input.y;
  platformX = game.add.sprite(game.input.x - 50, positionY, 'platform');
  game.physics.enable(platformX, Phaser.Physics.ARCADE);
  platformX.body.immovable = true;
}

