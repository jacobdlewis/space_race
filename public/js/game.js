
var platformGroup;
var ready = false;
var gameStarted = false;
var eurecaServer;
var eClient;
var created = false;
var playerRole;
var player2 = false;
var platform = 0;
var playerHealth = 2;
var nextPlatformTick = 0;

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
}


/* call functions on all clients using eurecaServer.distribute*/

function sendPlatform() {
  if(playerRole == 'engineer1'){
    eurecaServer.distribute("setPlatform", {
      x: cursorX,
      y: cursorY
    })
  }
}


function chooseRole(role) {
  playerRole = role;
}

game.state.add('playgame', { preload: preload, create:eurecaClientSetupGame, update:update });
var cursorX;
var cursorY;
var cameraScrollRate = .05;
var playerGravity = 350;
var leftButton;
var leftButtonDown = false;
var rightButton;
var rightButtonDown = false;
var currentPlatformType = "US_solidPlatform";

function preload () {
  game.load.image( 'platform', '/assets/platform_start.png');
  game.load.spritesheet( 'player1', '/assets/astrousa.png', 32, 64, 3);
  game.load.spritesheet( 'player2', '/assets/astroussr.png', 32, 64, 3);
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

Player = function(game, id, num) {
  this.num = num
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
  this.self = game.add.sprite(90+num*5, 8650, 'player'+num);
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

  if (cursors.up.isDown && this.body.touching.down) {
    this.body.velocity.y = -300;
    gameStarted = true;
  }

};

Platforms = function(game, x, y, type) {
  var x = x;
  var y = y;

  this.game = game;
  this.self = platformGroup.create(x, y, type);
  game.physics.enable(this.self, Phaser.Physics.ARCADE);
  this.self.enableBody = true;
  this.self.body.immovable = true;
  this.self.body.setSize(76, 9, 0, 20);
  this.self.type = type;

};


function createGame () {
  eurecaServer.playerHandshake();
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.world.setBounds(0, 0, 320, 9000);

  game.background = game.add.sprite(0, -400, 'background');

  game.background.inputEnabled = true;
  //game.background.events.onInputDown.add(setPlatform, this);
  if (playerRole === "astronaut1" || playerRole === "astronaut2") {
    game.background.events.onInputDown.add(jumpPlayer,this);
  } else if (playerRole === "engineer1" || playerRole === "engineer2") {
    game.background.events.onInputDown.add(sendPlatform,this);
  }

  startingSpace = game.add.sprite(110, 8750, 'platform');
  game.physics.enable(startingSpace, Phaser.Physics.ARCADE);
  startingSpace.body.immovable = true;

  player = new Player(game, myId, 1);
  player = player.self;
  player.animations.add('left', [0]);
  player.animations.add('right', [1]);
  player.animations.add('front', [2]);

  if (playerRole === "astronaut1" || playerRole === "astronaut2") {
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
  }

  if (playerRole === "engineer1" || playerRole === "engineer2") {
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
  }


  cursors = game.input.keyboard.createCursorKeys();

  game.cameraLastX = game.camera.x;
  game.cameraLastY = game.camera.y;
  game.camera.y = 9000;

  platformGroup = game.add.physicsGroup();
  platformGroup.setAll('enableBody', true);
  platformGroup.setAll('body.immovable', true);

  created = true;
  setTimeout(function() {
    eurecaServer.distribute("setProp",{
      prop: "gameStarted",
      val: true
    })
  },3000)

}

function update () {
    game.physics.arcade.collide(player, startingSpace);
    game.physics.arcade.collide(player, platformGroup, platformEffect);
    if (player2) {
      game.physics.arcade.collide(player2, startingSpace);
      game.physics.arcade.collide(player2, platformGroup);
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

    if (playerRole=="astronaut1") {
      movePlayer1();
      eurecaServer.distribute("updateMan1",{
        x: player.x,
        y: player.y,
        vel: player.body.velocity.x
      })
    }
    if (playerRole=="astronaut2") {
      console.log(player2.body.velocity.x)
      movePlayer2();
      eurecaServer.distribute("updateMan2",{
        x: player2.x,
        y: player2.y,
        vel: player2.body.velocity.x
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
function jumpPlayer () {
  if (player.body.touching.down) {
  player.body.velocity.y = -300;
  }
}
function movePlayerLeft () {
  leftButtonDown = true;
  player.body.velocity.x = -150;
}
function leftButtonUp () {
  leftButtonDown = false;
}
function selectSolid () {
  currentPlatformType = "US_solidPlatform";
}
function selectIce () {
  currentPlatformType = "US_icePlatform";
}
function selectBounce () {
  currentPlatformType = "US_bouncePlatform";
}
function selectSpike () {
  currentPlatformType = "US_spikePlatform";
}
function selectSticky () {
  currentPlatformType = "US_slimePlatform";
}
function selectHole () {
  currentPlatformType = "hole";
}

function setPlatform(args) {
  if (game.time.now > nextPlatformTick) {
    platform = new Platforms(game, args.x, args.y, currentPlatformType);
    platform = platform.self;
    nextPlatformTick = game.time.now + 1500;
  }
}

function createPlayer2(id) {
  player2 = new Player(game, id);
  player2 = player2.self;
  player2.animations.add('left', [0]);
  player2.animations.add('right', [1]);
  player2.animations.add('front', [2]);
}

function platformEffect() {
  platformGroup.children.forEach(function(child){
    if (child.body.touching.up && child.type == "US_bouncePlatform") {
      player.body.velocity.y -= 400;
    } else if (child.body.touching.up && child.type == "US_slimePlatform") {
      player.body.velocity.x = 0;
      player.body.velocity.y += 5;
    } else if (child.body.touching.up && child.type == "US_icePlatform") {
      if (player.body.velocity.x > 0) {
        player.body.velocity.x -= 135;
      } else if (player.body.velocity.x < 0) {
        player.body.velocity.x += 135;
      }
    } else if (child.body.touching.up && child.type == "US_spikePlatform") {
      player.body.velocity.y = -250;
      playerHealth -= 1;
    }
  });
}
