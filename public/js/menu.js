var myId=0;
var ready = false;
var eurecaServer;
var eurecaClient;

var eurecaClientSetup = function() {
    eurecaClient = new Eureca.Client();
    //create an instance of eureca.io client
    eurecaClient.ready(function (proxy) {
        eurecaServer = proxy;
    });
    //methods defined under "exports" namespace become available in the server side
    eurecaClient.exports.setId = function(id) {
        //create() is moved here to make sure nothing is created before uniq id assignation
        myId = id;
        create();
        ready = true;
        eClient = eurecaClient;
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