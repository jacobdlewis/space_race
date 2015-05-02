game.state.add('playgame', { preload: preload, create:create, update:update });

var platformGroup;
var myId=0;
var eurecaServer;
var ready = false;
var nextPlatformTimer = 0;
var gameStarted = false;
var platformX;
var cursorX;
var cursorY;

function preload () {
  game.load.image( 'platform', '/assets/basic_platform.png');
  game.load.image( 'player', '/assets/player.png');
  game.load.image( 'background', '/assets/background.png');
}

function create () {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.world.setBounds(0, 0, 320, 9000);

  game.background = game.add.tileSprite(0, 0, 320, 9000, 'background');
  player = game.add.sprite(130, 8800, 'player');
  startingSpace = game.add.sprite(110, 8850, 'platform');

  game.physics.enable(player, Phaser.Physics.ARCADE);
  player.body.gravity.y = 300;
  game.physics.enable(startingSpace, Phaser.Physics.ARCADE);
  startingSpace.body.immovable = true;

  cursors = game.input.keyboard.createCursorKeys();

  game.background.inputEnabled = true;
  game.background.events.onInputDown.add(setPlatform, this);

  game.cameraLastX = game.camera.x;
  game.cameraLastY = game.camera.y;

  game.camera.y = 9000;

  platformGroup = game.add.physicsGroup();
  platformGroup.setAll('enableBody', true);
  platformGroup.setAll('body.immovable', true);

}

function update () {

  game.physics.arcade.collide(player, startingSpace);
  game.physics.arcade.collide(player, platformGroup);

  if (cursors.left.isDown) {
    player.body.velocity.x = -100
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
    game.background.y -= 0.4 * (game.cameraLastY - game.camera.y);
    game.cameraLastY = game.camera.y;
  }

  if (gameStarted ===true) {
    game.camera.y -= .05;
  }

  cursorX = game.input.x - 50;
  cursorY = (game.world.y * -1) + game.input.y;
}

function setPlatform () {
  var p = platformGroup.children.length - 1;
  if (!platformGroup.children[0]) {
    platform1 = platformGroup.create(cursorX, cursorY, 'platform');
    platform1.enableBody = true;
    platform1.body.immovable = true;
  } else if (platformGroup.children[p].y - cursorY > 70) {
    platform1 = platformGroup.create(cursorX, cursorY, 'platform');
    platform1.enableBody = true;
    platform1.body.immovable = true;
  }

}

var eurecaClientSetup = function() {
    //create an instance of eureca.io client
    var eurecaClient = new Eureca.Client();

    eurecaClient.ready(function (proxy) {
        eurecaServer = proxy;
    });

    eurecaClient.exports.setId = function(id)
    {
        //create() is moved here to make sure nothing is created before uniq id assignation
        myId = id;
        create();
        eurecaServer.handshake();
        ready = true;
    };

};

