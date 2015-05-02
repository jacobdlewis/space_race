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
var maxPlatforms = 2;
var cameraScrollRate = .05;
var playerGravity = 350;
var leftButton;
var leftButtonDown = false;
var rightButton;
var rightButtonDown = false;

function preload () {
  game.load.image( 'platform', '/assets/basic_platform.png');
  game.load.image( 'player', '/assets/player.png');
  game.load.image( 'background', '/assets/space_race_bg_2_320.jpg');
  game.load.image( 'leftButton', '/assets/LeftButton.png');
  game.load.image( 'rightButton', '/assets/RightButton.png');
}

function create () {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.world.setBounds(0, 0, 320, 9000);

  game.background = game.add.tileSprite(0, 0, 320, 9000, 'background');
  game.background.inputEnabled = true;
  game.background.events.onInputDown.add(setPlatform, this);

  startingSpace = game.add.sprite(110, 8880, 'platform');
  game.physics.enable(startingSpace, Phaser.Physics.ARCADE);
  startingSpace.body.immovable = true;

  player = game.add.sprite(130, 8800, 'player');
  game.physics.enable(player, Phaser.Physics.ARCADE);
  player.body.gravity.y = playerGravity;

  leftButton = game.add.sprite(10, 410, 'leftButton');
  leftButton.fixedToCamera = true;
  leftButton.inputEnabled = true;
  leftButton.events.onInputDown.add(movePlayerLeft, this);
  leftButton.events.onInputUp.add(leftButtonUp, this);
  rightButton = game.add.sprite(260, 410, 'rightButton');
  rightButton.fixedToCamera = true;
  rightButton.inputEnabled = true;
  rightButton.events.onInputDown.add(movePlayerRight, this);
  rightButton.events.onInputUp.add(rightButtonUp, this);


  cursors = game.input.keyboard.createCursorKeys();

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

  if (cursors.left.isDown || leftButtonDown) {
    player.body.velocity.x = -150
  } else if (cursors.right.isDown || rightButtonDown) {
    player.body.velocity.x = 150;
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

  if (gameStarted === true) {
    game.camera.y -= cameraScrollRate;
  }

  cursorX = game.input.x - 50;
  cursorY = (game.world.y * -1) + game.input.y;
  console.log(cursorX, cursorY);

  if (player.x < 0) {
    player.x = 300;
  }
  if (player.x > 320) {
    player.x = 0;
  }
  if (player.y < 8000) {
    playerGravity = 300;
    cameraScrollRate = .75;
    player.body.gravity.y = playerGravity;
  } else if (player.y < 7000) {
    playerGravity = 275;
    player.body.gravity.y = playerGravity;
    cameraScrollRate = 1;
  }

}

function movePlayerRight () {
  rightButtonDown = true;
  player.body.velocity.x = 150;
}
function rightButtonUp () {
  rightButtonDown = false;
}

function movePlayerLeft () {
  leftButtonDown = true;
  player.body.velocity.x = -150;
}
function leftButtonUp () {
  leftButtonDown = false;
}

function setPlatform () {
  var p = platformGroup.children.length - 1;
  var livingChildren = platformGroup.countLiving();
  if (!platformGroup.children[0]) {
    platform1 = platformGroup.create(cursorX, cursorY, 'platform');
    platform1.enableBody = true;
    platform1.body.immovable = true;
  } else if (platformGroup.children[p].y - cursorY > 70) {
    platform1 = platformGroup.create(cursorX, cursorY, 'platform');
    platform1.enableBody = true;
    platform1.body.immovable = true;
    if (livingChildren >= maxPlatforms) {
      platformGroup.children[0].destroy();
    }
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

