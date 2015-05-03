
var platformGroup;
var ready = false;
var nextPlatformTimer = 0;
var gameStarted = false;
var eurecaServer;
var eClient;
var created = false;
var playerRole;

var eurecaClientSetupGame = function() {
    eClient = eurecaClient;
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

/* call functions on all clients using eurecaServer.distribute*/

function sendPlatform() {

  eurecaServer.distribute("setPlatform", {
    x: cursorX,
    y: cursorY
  })

}


function chooseRole(role) {
  playerRole = role;
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
  game.load.image( 'platform', '/assets/platform_start.png');
  game.load.spritesheet( 'player', '/assets/astrousa.png', 32, 64, 3);
  game.load.image( 'background', '/assets/space_race_bg_v2.jpg');
  game.load.image( 'leftButton', '/assets/LeftButton.png');
  game.load.image( 'rightButton', '/assets/RightButton.png');
  game.load.image( 'US_solidPlatform', '/assets/platform_normal_usa.png');
  game.load.image( 'USSR_solidPlatform', '/assets/platform_normal_ussr.png');
  game.load.image( 'US_icePlatform', '/assets/platform_snow_usa.png');
  game.load.image( 'USSR_icePlatform', '/assets/platform_snow_ussr.png');
  game.load.image( 'US_bouncePlatform', '/assets/platform_bounce_usa.png');
  game.load.image( 'USSR_bouncePlatform', '/assets/platform_bounce_ussr.png');
  game.load.image( 'US_spikePlatform', '/assets/platform_spike_usa.png');
  game.load.image( 'USSR_spikePlatform', '/assets/platform_spike_ussr.png');
  game.load.image( 'US_slimePlatform', '/assets/platform_slime_usa.png');
  game.load.image( 'USSR_slimePlatform', '/assets/platform_slime_ussr.png');
  game.load.image( 'solidPlatform', '/assets/solid_platform.png');
  game.load.image( 'icePlatform', '/assets/ice_platform.png');
  game.load.image( 'bouncePlatform', '/assets/bounce_platform.png');
  game.load.image( 'spikePlatform', '/assets/spike_platform.png');
  game.load.image( 'stickyPlatform', '/assets/sticky_platform.png');
  game.load.image( 'holePlatform', '/assets/hole_platform.png');
}

Player = function(game, id) {
  this.cursors = {
      left:false,
      right:false,
      up:false,
      fire:false
  };

  this.input = {
      left:false,
      right:false,
      up:false,
      fire:false
  };

  this.game = game;
  this.self = game.add.sprite(130, 8650, 'player');
  game.physics.enable(this.self, Phaser.Physics.ARCADE);
  this.self.body.gravity.y = playerGravity;
  this.self.id = id;
};

Player.prototype.update = function() {
  var inputChanged = (
    this.cursor.left != this.input.left ||
    this.cursor.right != this.input.right ||
    this.cursor.up != this.input.up
  );

  if (inputChanged) {
    //Handle input change here
    //send new values to the server
    if (this.player.id == myId) {
        // send latest valid state to the server
        this.input.x = this.player.x;
        this.input.y = this.player.y;
    }
  }

  if (this.cursors.left.isDown || leftButtonDown) {
    this.self.body.velocity.x = -150
  } else if (this.cursors.right.isDown || rightButtonDown) {
    this.self.body.velocity.x = 150;
  } else {
    this.self.body.velocity.x = 0;
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.body.velocity.y = -300;
    gameStarted = true;
  }

};

function createGame () {
  eurecaServer.playerHandshake();
  eurecaServer.getRole();
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.world.setBounds(0, 0, 320, 9000);

  game.background = game.add.sprite(0, -400, 'background');

  game.background.inputEnabled = true;
  //game.background.events.onInputDown.add(setPlatform, this);
  game.background.events.onInputDown.add(sendPlatform,this);

  startingSpace = game.add.sprite(110, 8750, 'platform');
  game.physics.enable(startingSpace, Phaser.Physics.ARCADE);
  startingSpace.body.immovable = true;



  player = new Player(game, myId);
  player = player.self;
  player.animations.add('left', [0]);
  player.animations.add('right', [1]);
  player.animations.add('front', [2]);

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

}

function update () {
    game.physics.arcade.collide(player, startingSpace);
    game.physics.arcade.collide(player, platformGroup);

    if(game.camera.y !== game.cameraLastY) {
      game.background.y -= 0.4 * (game.cameraLastY - game.camera.y);
      game.cameraLastY = game.camera.y;
    }

    if (gameStarted === true) {
      game.camera.y -= cameraScrollRate;
    }

    cursorX = game.input.x - 50;
    cursorY = (game.world.y * -1) + game.input.y;

    if (playerRole=="astronaut") {
      movePlayer1();
      eurecaServer.distribute("updateMan1",{
        x: player.x,
        y: player.y
      })
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
  currentPlatformType = "slime";
}
function selectHole () {
  currentPlatformType = "hole";
}

function setPlatform(args) {
  var p = platformGroup.children.length - 1;
  var livingChildren = platformGroup.countLiving();
  if (!platformGroup.children[0]) {
    switch (currentPlatformType) {
      case "solid":
        platform1 = platformGroup.create(args.x, args.y, 'US_solidPlatform');
        break;
      case "ice":
        platform1 = platformGroup.create(args.x, args.y, 'US_icePlatform');
        break;
      case "bounce":
        platform1 = platformGroup.create(args.x, args.y, 'US_bouncePlatform');
        break;
      case "spike":
        platform1 = platformGroup.create(args.x, args.y, 'US_spikePlatform');
        break;
      case "slime":
        platform1 = platformGroup.create(args.x, args.y, 'US_slimePlatform');
        break;
      default:
        platform1 = platformGroup.create(args.x, args.y, 'platform');
        break;
    };
    platform1.enableBody = true;
    platform1.body.setSize(76, 9, 0, 20);
    platform1.body.immovable = true;
  } else if (platformGroup.children[p].y - args.y > 70 || platformGroup.children[p].y - args.y < -70) {
    switch (currentPlatformType) {
      case "solid":
        platform1 = platformGroup.create(args.x, args.y, 'platform');
        break;
      case "ice":
        platform1 = platformGroup.create(args.x, args.y, 'US_icePlatform');
        break;
      case "bounce":
        platform1 = platformGroup.create(args.x, args.y, 'US_bouncePlatform');
        break;
      case "spike":
        platform1 = platformGroup.create(args.x, args.y, 'US_spikePlatform');
        break;
      case "slime":
        platform1 = platformGroup.create(args.x, args.y, 'US_slimePlatform');
        break;
      default:
        platform1 = platformGroup.create(args.x, args.y, 'platform');
        break;
    };
    platform1.enableBody = true;
    platform1.body.setSize(76, 9, 0, 20);
    platform1.body.immovable = true;
    if (livingChildren >= maxPlatforms) {
      platformGroup.children[0].destroy();
    }
  }
}
