var myId=0;
var ready = false;
var eurecaServer;

var eurecaClientSetup = function() {
    //create an instance of eureca.io client
    var eurecaClient = new Eureca.Client();
    eurecaClient.ready(function (proxy) {
        eurecaServer = proxy;
    });
    //methods defined under "exports" namespace become available in the server side
    eurecaClient.exports.setId = function(id) {
        //create() is moved here to make sure nothing is created before uniq id assignation
        myId = id;
        create();
        eurecaServer.handshake();
        ready = true;
    }
    eurecaClient.exports.kill = function(id){
        if (tanksList[id]) {
            tanksList[id].kill();
            console.log('killing ', id, tanksList[id]);
        }
    }
    eurecaClient.exports.spawnEnemy = function(i, x, y){
        if (i == myId) return; //this is me
        console.log('SPAWN');
        var tnk = new Tank(i, game, tank);
        tanksList[i] = tnk;
    }
    eurecaClient.exports.updateState = function(id, state)
    {
        if (tanksList[id])  {
            tanksList[id].cursor = state;
            tanksList[id].tank.x = state.x;
            tanksList[id].tank.y = state.y;
            tanksList[id].tank.angle = state.angle;
            tanksList[id].turret.rotation = state.rot;
            tanksList[id].update();
        }
    }
}

game.state.add('menu', { preload:preload, create:eurecaClientSetup } );
game.state.start('menu');

function preload() {
  game.load.image( 'menu', '/assets/start_button.png')
}

function create() {
  menu = game.add.sprite(0, 380, 'menu');
  menu.inputEnabled = true;
  menu.events.onInputDown.add(startGame, this);
  var ENTER = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
  ENTER.onDown.add(startGame)
}

function startGame () {
  game.state.start('playgame');
}