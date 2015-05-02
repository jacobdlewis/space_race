game.state.add('playgame', { preload: preload, create:create, update:update });


var platformX;
var myId=0;
var eurecaServer;
var ready = false;
var nextPlatformTimer = 0;

function preload () {
  game.load.image( 'platform', '/assets/basic_platform.png');
  game.load.image( 'player', '/assets/player.png');
  game.load.image( 'background', '/assets/background.png');
}

function create () {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.world.setBounds(0, 0, 320, 9000);

  game.bg = game.add.tileSprite(0, 0, 320, 9000, 'background');
  player = game.add.sprite(250, 8800, 'player');
  platform = game.add.sprite(160, 8970, 'platform');


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

}

function update () {

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
    player.body.velocity.y = -200;
  }

  if(game.camera.y !== game.cameraLastY) {
    game.bg.y -= 0.4 * (game.cameraLastY - game.camera.y);
    game.cameraLastY = game.camera.y;
  }

  game.camera.y -= .05;

  // if(game.input.onMouseDown() && game.time.now > nextPlatformTimer) {
  //   setPlatform();
  //   console.log('click');
  //   nextPlatformTimer = game.time.now + 600;
  // }

}

function setPlatform () {
  var positionY = (game.world.y * -1) + game.input.y;
  platformX = game.add.sprite(game.input.x - 50, positionY, 'platform');
  game.physics.enable(platformX, Phaser.Physics.ARCADE);
  platformX.body.immovable = true;
  console.log('yes ' + positionY);
}

var eurecaClientSetup = function() {
    //create an instance of eureca.io client
    var eurecaClient = new Eureca.Client();

    eurecaClient.ready(function (proxy) {
        eurecaServer = proxy;
    });


    //methods defined under "exports" namespace become available in the server side

    eurecaClient.exports.setId = function(id)
    {
        //create() is moved here to make sure nothing is created before uniq id assignation
        myId = id;
        create();
        eurecaServer.handshake();
        ready = true;
    };

};

