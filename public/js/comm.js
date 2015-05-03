
/* call functions on all clients using eurecaServer.distribute*/

function sendAllReady() {
  eurecaServer.distribute("setAllReady",null);
}

function sendPlatform() {
  //sounds.ping.note();
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

function setProp(args) {
  window[args.prop] = args.val
}

var p1touchdown = true;
var p2touchdown = true;

// player1

function movePlayer1() {
  player.newsound = false;
  if (cursors.left.isDown || leftButtonDown) {
      sounds.dude.turn();
      player.newsound = "turn";
      player.body.velocity.x = -150;
      player.animations.play("left");
    } else if (cursors.right.isDown || rightButtonDown) {
      sounds.dude.turn();
      player.newsound = "turn";
      player.body.velocity.x = 150;
      player.animations.play('right');
    } else {
      if (player.body.velocity.x > 0) {
        player.body.velocity.x -= 5;
        player.animations.play('left');
      } else if (player.body.velocity.x < 0) {
        player.body.velocity.x += 5;
        player.animations.play('right');
      } else if (player.body.velocity.x === 0) {
        player.frame = 8;
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
      var gameOverTime = game.time.now + 3000;
      gameOverText = game.add.text(game.camera.x + 70, game.camera.y + 160, "GAME OVER", { fontSize: '32px', fill: 'white' });
      cameraScrollRate = 0;
      if (game.time.now > gameOverTime) {
        game.state.start('gameOver');
      }
    }

}

// player2

function movePlayer2() {
  if (cursors.left.isDown || leftButtonDown) {
      sounds.dude.turn()
      player2.newsound = "turn";
      player2.body.velocity.x = -150
      player2.animations.play('left')
    } else if (cursors.right.isDown || rightButtonDown) {
      sounds.dude.turn()
      player2.newsound = "turn";
      player2.body.velocity.x = 150;
      player2.animations.play('right')
    } else {
      player2.body.velocity.x = 0;
      player2.frame = 8;
    }

    if (player2.body.touching.down && player2.body.touching.down != p2touchdown) {
      sounds.dude.land()
      player2.newsound = "land";
    }
    p2touchdown = player2.body.touching.down;

    if (cursors.up.isDown && player2.body.touching.down) {
      sounds.dude.jump()
      player2.newsound = "jump";
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


