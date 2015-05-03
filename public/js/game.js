
var platformGroup;
var ready = false;
var allReady = false;
var gameStarted = false;
var eurecaServer;
var eClient;
var created = false;
var playerRole;
var player2 = false;
var platform = 0;
var playerHealth = 2;
var nextPlatformTick = 0;

var sounds = new Soundtrack();
sounds.bg.start();

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

function disconnect(){
  location.reload();

}

function removeReadyText(){
  waitText.destroy();
}

function sendPlatform() {
  if(allReady){
    eurecaServer.distribute("setPlatform", {
      x: cursorX,
      y: cursorY,
      type: currentPlatformType
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
var lastPlatformType;

function preload () {
  game.load.image( 'platform', '/assets/platform_start.png');
  game.load.spritesheet( 'player1', '/assets/astrousa_v2.png', 32, 64, 9);
  game.load.spritesheet( 'player2', '/assets/astroussr_v2.png', 32, 64, 9);
  game.load.image( 'background', '/assets/space_race_bg_v2.jpg');
  game.load.image( 'paralax_background', '/assets/space_race_bg_overlay.png');
  game.load.image( 'leftButton', '/assets/control_arrow_left.png');
  game.load.image( 'rightButton', '/assets/control_arrow_right.png');
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
  game.load.image( 'US_badge', '/assets/badge_usa.png');
  game.load.image( 'USSR_badge', '/assets/badge_ussr.png');
  game.load.image( 'heart', '/assets/heart.png');

  game.load.spritesheet( 'solidPlatform', '/assets/button_platform_normal.png', 64, 64, 2);
  game.load.spritesheet( 'icePlatform', '/assets/button_platform_snow.png', 64, 64, 2);
  game.load.spritesheet( 'bouncePlatform', '/assets/button_platform_bounce.png', 64, 64, 2);
  game.load.spritesheet( 'spikePlatform', '/assets/button_platform_spike.png', 64, 64, 2);
  game.load.spritesheet( 'stickyPlatform', '/assets/button_platform_slime.png', 64, 64, 2);
  //game.load.image( 'holePlatform', '/assets/hole_platform.png');
}

Player = function(game, id, num, x, y) {
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
  this.self = game.add.sprite(x, y, 'player'+num);
  game.physics.enable(this.self, Phaser.Physics.ARCADE);
  this.self.body.gravity.y = playerGravity;
  this.self.id = id;
  this.self.animations.add('left', [0, 1, 2, 3], 10, true);
  this.self.animations.add('right', [4, 5, 6, 7], 10, true);
  this.self.frame = 8;
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
  // playerRole exists at this time
  eurecaServer.playerHandshake();
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.world.setBounds(0, 0, 320, 9000);

  game.background = game.add.sprite(0, -400, 'background');
  game.paralax_bg = game.add.sprite(0, -400, 'paralax_background');

  game.background.inputEnabled = true;
  if (playerRole === "astronaut1" || playerRole === "astronaut2") {
    //game.background.events.onInputDown.add(jumpPlayer,this);
  } else if (playerRole === "engineer1" || playerRole === "engineer2") {
    game.background.events.onInputDown.add(sendPlatform,this);
  }

  startingSpace = game.add.sprite(-5, 8750, 'platform');
  game.physics.enable(startingSpace, Phaser.Physics.ARCADE);
  startingSpace.body.immovable = true;

  player = new Player(game, myId, 1, 90, 8650);
  player = player.self;


  if (playerRole === "astronaut1" || playerRole === "astronaut2") {
    leftButton = game.add.sprite(10, 410, 'leftButton');
    leftButton.fixedToCamera = true;
    leftButton.inputEnabled = true;
    // leftButton.events.onInputDown.add(movePlayerLeft, this);
    // leftButton.events.onInputUp.add(leftButtonUp, this);
    rightButton = game.add.sprite(260, 410, 'rightButton');
    rightButton.fixedToCamera = true;
    rightButton.inputEnabled = true;
    // rightButton.events.onInputDown.add(movePlayerRight, this);
    // rightButton.events.onInputUp.add(rightButtonUp, this);
    health1 = game.add.sprite(10, 10, 'heart');
    health2 = game.add.sprite(50, 10, 'heart');
    health1.fixedToCamera = true;
    health2.fixedToCamera = true;
  }

  if (playerRole === "engineer1" || playerRole === "engineer2") {
    solidPlatform = game.add.sprite(10, 400, 'solidPlatform');
    solidPlatform.fixedToCamera = true;
    solidPlatform.inputEnabled = true;
    solidPlatform.frame = 1;
    solidPlatform.events.onInputDown.add(selectSolid, this);
    icePlatform = game.add.sprite(70, 400, 'icePlatform');
    icePlatform.fixedToCamera = true;
    icePlatform.inputEnabled = true;
    icePlatform.events.onInputDown.add(selectIce, this);
    bouncePlatform = game.add.sprite(130, 400, 'bouncePlatform');
    bouncePlatform.fixedToCamera = true;
    bouncePlatform.inputEnabled = true;
    bouncePlatform.events.onInputDown.add(selectBounce, this);
    spikePlatform = game.add.sprite(190, 400, 'spikePlatform');
    spikePlatform.fixedToCamera = true;
    spikePlatform.inputEnabled = true;
    spikePlatform.events.onInputDown.add(selectSpike, this);
    stickyPlatform = game.add.sprite(250, 400, 'stickyPlatform');
    stickyPlatform.fixedToCamera = true;
    stickyPlatform.inputEnabled = true;
    stickyPlatform.events.onInputDown.add(selectSticky, this);
    // holePlatform = game.add.sprite(200, 440, 'holePlatform');
    // holePlatform.fixedToCamera = true;
    // holePlatform.inputEnabled = true;
    // holePlatform.events.onInputDown.add(selectHole, this);
  }



  if (playerRole=="astronaut2" || playerRole=="engineer2") {
    player2 = new Player(game, 1000, 2, 220, 8650);
    player2 = player2.self;
    ussr_badge = game.add.sprite(255, 1, 'USSR_badge');
    ussr_badge.fixedToCamera = true;
  }

  if (playerRole === "astronaut1" || playerRole === "engineer1") {
    us_badge = game.add.sprite(255, 1, 'US_badge');
    us_badge.fixedToCamera = true;
  }

  cursors = game.input.keyboard.createCursorKeys();

  game.cameraLastX = game.camera.x;
  game.cameraLastY = game.camera.y;
  game.camera.y = 9000;

  platformGroup = game.add.physicsGroup();
  platformGroup.setAll('enableBody', true);
  platformGroup.setAll('body.immovable', true);

  readyText = game.add.text(40, 8650, "Click When Ready!", {fill: "#fff", fontSize: "25px"});

  created = true;

}

function update () {
    game.physics.arcade.collide(player, startingSpace);
    game.physics.arcade.collide(player, platformGroup, platformEffect);
    game.physics.arcade.collide(player2, platformGroup, ussrPlatFormEffect);
    if (player2) {
      game.physics.arcade.collide(player2, startingSpace);
      game.physics.arcade.collide(player2, platformGroup);
    }

    if(game.camera.y !== game.cameraLastY) {
      game.background.y -= 0.4 * (game.cameraLastY - game.camera.y);
      //game.paralax_bg.y -= 0.5 * (game.cameraLastY - game.camera.y);
      game.cameraLastY = game.camera.y;
    }

    if (gameStarted === true && allReady) {
      game.camera.y -= cameraScrollRate;
    }

    if (gameStarted === false) {
      game.background.events.onInputDown.add(replaceReadyText, this);
    }

    cursorX = game.input.x - 50;
    cursorY = (game.world.y * -1) + game.input.y;

    if (playerRole=="astronaut1") {
      movePlayer1();
      eurecaServer.distribute("updateMan1",{
        x: player.x,
        y: player.y,
        vel: player.body.velocity.x,
        newsound: player.newsound
      })
    }
    if (playerRole=="astronaut2") {
      movePlayer2();
      eurecaServer.distribute("updateMan2",{
        x: player2.x,
        y: player2.y,
        vel: player2.body.velocity.x
      })
    }
    resetPlatformButtonBorders();
  }

function replaceReadyText() {
  readyText.destroy()
  waitText = game.add.text(100, 8650, "Waiting...", {fill: "#fff", fontSize: "25px"})
  eurecaServer.sendReadyState();
}

// function movePlayerRight () {
//   rightButtonDown = true;
//   player.body.velocity.x = 150;
// }
// function rightButtonUp () {
//   rightButtonDown = false;
// }
// function jumpPlayer () {
//   if (player.body.touching.down) {
//     player.body.velocity.y = -300;
//   }
// }
// function movePlayerLeft () {
//   leftButtonDown = true;
//   player.body.velocity.x = -150;
// }
// function leftButtonUp () {
//   leftButtonDown = false;
// }

function selectSolid () {
  lastPlatformType = currentPlatformType;
  if(playerRole === "engineer1") {
    currentPlatformType = "US_solidPlatform";
  } else {
    currentPlatformType = "USSR_solidPlatform"
  }
  solidPlatform.frame = 1;
}
function selectIce () {
  lastPlatformType = currentPlatformType;
  if(playerRole === "engineer1") {
    currentPlatformType = "US_icePlatform";
  } else {
    currentPlatformType = "USSR_icePlatform"
  }
  icePlatform.frame = 1;
}
function selectBounce () {
  lastPlatformType = currentPlatformType;
  if(playerRole === "engineer1") {
    currentPlatformType = "US_bouncePlatform";
  } else {
    currentPlatformType = "USSR_bouncePlatform"
  }
  bouncePlatform.frame = 1;
}
function selectSpike () {
  lastPlatformType = currentPlatformType;
  if(playerRole === "engineer1") {
    currentPlatformType = "US_spikePlatform";
  } else {
    currentPlatformType = "USSR_spikePlatform"
  }
  spikePlatform.frame = 1;
}
function selectSticky () {
  lastPlatformType = currentPlatformType;
  if(playerRole === "engineer1") {
    currentPlatformType = "US_slimePlatform";
  } else {
    currentPlatformType = "USSR_slimePlatform"
  }
  stickyPlatform.frame = 1;
}
function selectHole () {
  lastPlatformType = currentPlatformType;
  currentPlatformType = "hole";
}

function setPlatform(args) {
  if (game.time.now > nextPlatformTick && checkPlatformPlacement()) {
    platform = new Platforms(game, args.x, args.y, args.type);
    platform = platform.self;
    nextPlatformTick = game.time.now + 1500;
    sounds.ping.note();
  }
}

function checkPlatformPlacement() {
  if (platformGroup.children.length < 1) {
    return true
  } else {
    for (var i = 0; i <= platformGroup.children.length; i++) {
      if (cursorY - (platformGroup.children[i].y > 60) || cursorY - (platformGroup.children[i].y < -60)) {
        return true
      } else {
        return true
      }
    }
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
      player2.body.velocity.y -= 400;
    } else if (child.body.touching.up && child.type == "US_slimePlatform") {
      player.body.velocity.x = 0;
      player.body.velocity.y += 5;
      player2.body.velocity.x = 0;
      player2.body.velocity.y += 5;
    } else if (child.body.touching.up && child.type == "US_icePlatform") {
      if (player.body.velocity.x > 0) {
        player.body.velocity.x -= 135;
        player2.body.velocity.x -= 135;
      } else if (player.body.velocity.x < 0) {
        player.body.velocity.x += 135;
        player2.body.velocity.x += 135;
      }
    } else if (child.body.touching.up && child.type == "US_spikePlatform") {
      player.body.velocity.y = -250;
      if (playerHealth === 2) {
        health2.destroy();
      }
      if (playerHealth ===1) {
        health1.destroy();
      }
      playerHealth -= 1;
    }
  });
}

function ussrPlatFormEffect() {
  platformGroup.children.forEach(function(child){
    if (child.body.touching.up && child.type == "USSR_bouncePlatform") {
      player.body.velocity.y -= 400;
      player2.body.velocity.y -= 400;
    } else if (child.body.touching.up && child.type == "USSR_slimePlatform") {
      player.body.velocity.x = 0;
      player.body.velocity.y += 5;
      player2.body.velocity.x = 0;
      player2.body.velocity.y += 5;
    } else if (child.body.touching.up && child.type == "USSR_icePlatform") {
      if (player.body.velocity.x > 0) {
        player.body.velocity.x -= 135;
        player2.body.velocity.x -= 135;
      } else if (player.body.velocity.x < 0) {
        player.body.velocity.x += 135;
        player2.body.velocity.x += 135;
      }
    } else if (child.body.touching.up && child.type == "USSR_spikePlatform") {
      player.body.velocity.y = -250;
      if (playerHealth === 2) {
        health2.destroy();
      }
      if (playerHealth ===1) {
        health1.destroy();
      }
      playerHealth -= 1;
    }
  });
}

function resetPlatformButtonBorders () {
  if (lastPlatformType === "US_solidPlatform" || lastPlatformType === "USSR_solidPlatform") {
    solidPlatform.frame = 0;
  }
  if (lastPlatformType === "US_slimePlatform" || lastPlatformType === "USSR_slimePlatform") {
    stickyPlatform.frame = 0;
  }
  if (lastPlatformType === "US_icePlatform" || lastPlatformType === "USSR_icePlatform") {
    icePlatform.frame = 0;
  }
  if (lastPlatformType === "US_bouncePlatform" || lastPlatformType === "USSR_bouncePlatform") {
    bouncePlatform.frame = 0;
  }
  if (lastPlatformType === "US_spikePlatform" || lastPlatformType === "USSR_spikePlatform") {
    spikePlatform.frame = 0;
  }
}
