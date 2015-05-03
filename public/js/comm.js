
/* call functions on all clients using eurecaServer.distribute*/

function sendAllReady() {
  console.log("sent");
  eurecaServer.distribute("setAllReady",null);
}

function sendPlatform() {

  eurecaServer.distribute("setPlatform", {
    x: cursorX,
    y: cursorY
  })
}

function updateMan1(args) {
  if (playerRole != "astronaut1") {
    player.x = args.x
    player.y = args.y
    var xVelocity = args.vel
    if(xVelocity < 0){
      player.animations.play('left');
    } else if(xVelocity > 0) {
      player.animations.play('right');
    } else {player.frame = 8}
    if (args.newsound) {
      switch(args.newsound) {
        case "turn":
            sounds.dude.turn();
          break;
        case "jump":
            sounds.dude.jump();
          break;
        case "land":
            sounds.dude.land();
          break;
      }
    }
  }
}
function updateMan2(args) {
  if (playerRole != "astronaut2") {
    player2.x = args.x
    player2.y = args.y
    var xVelocity = args.vel
    if(xVelocity < 0){
      player2.animations.play('left');
    } else if(xVelocity > 0) {
      player2.animations.play('right');
    } else {player2.frame = 8}
  }
}

function setProp(args) {
  window[args.prop] = args.val
}

var playerlanded = true;
var player2landed = true;

// player1

function movePlayer1() {
  player.newsound = false;
  if (cursors.left.isDown || leftButtonDown) {
      sounds.dude.turn()
      player.newsound = "turn";
      player.body.velocity.x = -150
      player.frame = 0;
    } else if (cursors.right.isDown || rightButtonDown) {
      sounds.dude.turn()
      player.newsound = "turn";
      player.body.velocity.x = 150;
      player.frame = 1;
    } else {
      if (player.body.velocity.x > 0) {
        player.body.velocity.x -= 5;
        player.frame = 0;
      } else if (player.body.velocity.x < 0) {
        player.body.velocity.x += 5;
        player.frame = 1;
      } else if (player.body.velocity.x === 0) {
        player.frame = 2;
      }
    }

    if (player.body.touching.down && player.body.touching.down != p1touchdown) {
      sounds.dude.land()
      player.newsound = "land";
    }
    p1touchdown = player.body.touching.down;

    if (cursors.up.isDown && player.body.touching.down) {
      sounds.dude.jump()
      player.newsound = "jump";
      player.body.velocity.y = -300;
      gameStarted = true;
    }

     if (player.x < 0) {
      player.x = 300;
    }
    if (player.x > 320) {
      player.x = 0;
    }
    if (player.y < 8000) {
      var playerGravity = 300;
      if (cameraScrollRate!=.75) {
        eurecaServer.distribute("setProp",{
          prop: "cameraScrollRate",
          val: .75
        })
      }
      player.body.gravity.y = playerGravity;
    } else if (player.y < 7000) {
      var playerGravity = 275;
      player.body.gravity.y = playerGravity;
      if (cameraScrollRate!=1) {
        eurecaServer.distribute("setProp",{
          prop: "cameraScrollRate",
          val: 1
        })
      }
    }

    if (player.y > game.camera.y + 480 || playerHealth <= 0) {
      gameOverText = game.add.text(game.camera.x + 70, game.camera.y + 160, "GAME OVER", { fontSize: '32px', fill: 'white' });
      cameraScrollRate = 0;
    }

}

// player2

function movePlayer2() {
  if (cursors.left.isDown || leftButtonDown) {
      sounds.dude.turn()
      player2.body.velocity.x = -150
      player2.frame = 0;
    } else if (cursors.right.isDown || rightButtonDown) {
      sounds.dude.turn()
      player2.body.velocity.x = 150;
      player2.frame = 1;
    } else {
      player2.body.velocity.x = 0;
      player2.frame = 2;
    }

    if (player2.body.touching.down && player2.body.touching.down != p2touchdown) {
      sounds.dude.land()
    }
    p2touchdown = player2.body.touching.down;

    if (cursors.up.isDown && player2.body.touching.down) {
      player2.body.velocity.y = -300;
      gameStarted = true;
    }

     if (player2.x < 0) {
      player2.x = 300;
    }
    if (player2.x > 320) {
      player2.x = 0;
    }
    if (player2.y < 8000) {
      var playerGravity = 300;
      if (cameraScrollRate!=.75) {
        eurecaServer.distribute("setProp",{
          prop: "cameraScrollRate",
          val: .75
        })
      }
      player2.body.gravity.y = playerGravity;
    } else if (player2.y < 7000) {
      var playerGravity = 275;
      player2.body.gravity.y = playerGravity;
      if (cameraScrollRate!=1) {
        eurecaServer.distribute("setProp",{
          prop: "cameraScrollRate",
          val: 1
        })
      }
    }

    if (player2.y > game.camera.y + 480) {
      gameOverText = game.add.text(game.camera.x + 70, game.camera.y + 160, "GAME OVER", { fontSize: '32px', fill: 'white' });
      cameraScrollRate = 0;
    }

}


