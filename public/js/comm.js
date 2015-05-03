
/* call functions on all clients using eurecaServer.distribute*/

function sendPlatform() {

  eurecaServer.distribute("setPlatform", {
    x: cursorX,
    y: cursorY
  })

}

function updateMan1(args) {
  if (playerRole != "astronaut") {
    player.x = args.x
    player.y = args.y  
  }
}




// player1

function movePlayer1() {
	if (cursors.left.isDown || leftButtonDown) {
      player.body.velocity.x = -150
      player.frame = 0;
    } else if (cursors.right.isDown || rightButtonDown) {
      player.body.velocity.x = 150;
      player.frame = 1;
    } else {
      player.body.velocity.x = 0;
      player.frame = 2;
    }

    if (cursors.up.isDown && player.body.touching.down) {
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


