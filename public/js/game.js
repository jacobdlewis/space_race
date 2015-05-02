
var platformGroup;
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
    eurecaClient.exports.interact = function(action,args) {
      window[action](args);
    }
}

game.state.add('playgame', { preload: preload, create:eurecaClientSetupGame, update:update });
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
var currentPlatformType = "solid";

function preload () {
  game.load.image( 'platform', '/assets/basic_platform.png');
  game.load.image( 'player', '/assets/player.png');
  game.load.image( 'background', '/assets/space_race_bg_generic_320.jpg');
  game.load.image( 'leftButton', '/assets/LeftButton.png');
  game.load.image( 'rightButton', '/assets/RightButton.png');
  game.load.image( 'solidPlatform', '/assets/solid_platform.png');
  game.load.image( 'icePlatform', '/assets/ice_platform.png');
  game.load.image( 'bouncePlatform', '/assets/bounce_platform.png');
  game.load.image( 'spikePlatform', '/assets/spike_platform.png');
  game.load.image( 'stickyPlatform', '/assets/sticky_platform.png');
  game.load.image( 'holePlatform', '/assets/hole_platform.png');
}

function createGame () {
  eurecaServer.playerHandshake();
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.world.setBounds(0, 0, 320, 9000);

  game.background = game.add.sprite(0, -400, 'background');

  game.background.inputEnabled = true;
  //game.background.events.onInputDown.add(setPlatform, this);
  game.background.events.onInputDown.add(sendPlatform,this);

  startingSpace = game.add.sprite(110, 8880, 'platform');
  game.physics.enable(startingSpace, Phaser.Physics.ARCADE);
  startingSpace.body.immovable = true;

  player = game.add.sprite(130, 8800, 'player');
  game.physics.enable(player, Phaser.Physics.ARCADE);
  player.body.gravity.y = playerGravity;

  // leftButton = game.add.sprite(10, 410, 'leftButton');
  // leftButton.fixedToCamera = true;
  // leftButton.inputEnabled = true;
  // leftButton.events.onInputDown.add(movePlayerLeft, this);
  // leftButton.events.onInputUp.add(leftButtonUp, this);
  // rightButton = game.add.sprite(260, 410, 'rightButton');
  // rightButton.fixedToCamera = true;
  // rightButton.inputEnabled = true;
  // rightButton.events.onInputDown.add(movePlayerRight, this);
  // rightButton.events.onInputUp.add(rightButtonUp, this);

  solidPlatform = game.add.sprite(0, 400, 'solidPlatform');
  solidPlatform.fixedToCamera = true;
  solidPlatform.inputEnabled = true;
  solidPlatform.events.onInputDown.add(selectSolid, this);
  icePlatform = game.add.sprite(100, 400, 'icePlatform');
  icePlatform.fixedToCamera = true;
  icePlatform.inputEnabled = true;
  icePlatform.events.onInputDown.add(selectIce, this);
  bouncePlatform = game.add.sprite(200, 400, 'bouncePlatform');
  bouncePlatform.fixedToCamera = true;
  bouncePlatform.inputEnabled = true;
  bouncePlatform.events.onInputDown.add(selectBounce, this);
  spikePlatform = game.add.sprite(0, 440, 'spikePlatform');
  spikePlatform.fixedToCamera = true;
  spikePlatform.inputEnabled = true;
  spikePlatform.events.onInputDown.add(selectSpike, this);
  stickyPlatform = game.add.sprite(100, 440, 'stickyPlatform');
  stickyPlatform.fixedToCamera = true;
  stickyPlatform.inputEnabled = true;
  stickyPlatform.events.onInputDown.add(selectSticky, this);
  holePlatform = game.add.sprite(200, 440, 'holePlatform');
  holePlatform.fixedToCamera = true;
  holePlatform.inputEnabled = true;
  holePlatform.events.onInputDown.add(selectHole, this);


  cursors = game.input.keyboard.createCursorKeys();

  game.cameraLastX = game.camera.x;
  game.cameraLastY = game.camera.y;
  game.camera.y = 9000;

  platformGroup = game.add.physicsGroup();
  platformGroup.setAll('enableBody', true);
  platformGroup.setAll('body.immovable', true);

  created = true;
  console.log(game.camera);

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
    console.log(game.camera.y)

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

    if (player.y > game.camera.y + 480) {
      gameOverText = game.add.text(game.camera.x + 70, game.camera.y + 160, "GAME OVER", { fontSize: '32px', fill: 'white' });
      cameraScrollRate = 0;
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

function selectSolid () {
  currentPlatformType = "solid";
}
function selectIce () {
  currentPlatformType = "ice";
}
function selectBounce () {
  currentPlatformType = "bounce";
}
function selectSpike () {
  currentPlatformType = "spike";
}
function selectSticky () {
  currentPlatformType = "sticky";
}
function selectHole () {
  currentPlatformType = "hole";
}


function setPlatform(args) {
  console.log("platform set with args")
  console.log(args)
  var p = platformGroup.children.length - 1;
  var livingChildren = platformGroup.countLiving();
  if (!platformGroup.children[0]) {
    platform1 = platformGroup.create(args.x, args.y, 'platform');
    platform1.enableBody = true;
    platform1.body.immovable = true;
  } else if (platformGroup.children[p].y - args.y > 70) {
    platform1 = platformGroup.create(args.x, args.y, 'platform');
    platform1.enableBody = true;
    platform1.body.immovable = true;
    if (livingChildren >= maxPlatforms) {
      platformGroup.children[0].destroy();
    }
  }
}





/* call functions on all clients using eurecaServer.distribute*/

function sendPlatform() {

  eurecaServer.distribute("setPlatform", {
    x: cursorX,
    y: cursorY
  })

}


function chooseRole(role) {
  console.log(role)
}
