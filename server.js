var express = require('express')
  , app = express(app)
  , server = require('http').createServer(app);

// serve static files from the current directory
app.set('port', (process.env.PORT || 8000));
app.use(express.static(__dirname+"/public"));
app.get('/', function(req, res){
  res.sendFile(__dirname+'/index.html');
});

//we'll keep clients data here
var clients = {};
//determines playerType assignment
var nextPlayerType = 'astronaut1';
var playerTypes = ['astronaut1','engineer1','astronaut2','engineer2']
var ptIndex = 0;
//determines if new game is needed
var currentGameId = 0;
var gameList = {}
//get EurecaServer class
var EurecaServer = require('eureca.io').EurecaServer;

//create an instance of EurecaServer
var eurecaServer = new EurecaServer({allow:['setId', 'setPlayerType', 'kill', 'updateState','interact','chooseRole','createPlayer2']});

//attach eureca.io to our http server
eurecaServer.attach(server);

//eureca.io provides events to detect clients connect/disconnect

//detect client connection
eurecaServer.onConnect(function (conn) {
    console.log('New Client id=%s ', conn.id, conn.remoteAddress);
    //the getClient method provide a proxy allowing us to call remote client functions
    var remote = eurecaServer.getClient(conn.id);
    //register the client
    clients[conn.id] = {id:conn.id, remote:remote, playerType: nextPlayerType, configured: false}
    //call setId (defined in the client side)
    remote.setId(conn.id);
    
});

eurecaServer.exports.configurePlayer = function() {

    var conn = this.connection;
    var client = clients[conn.id];
    console.log("         ----------     ")
    console.log(gameList[currentGameId])
    console.log("         ----------     ")

    if (!gameList[currentGameId]) {

        gameList[currentGameId]={readyPlayers: 0};
        gameList[currentGameId].players = 1;
        client.playerType = playerTypes[ptIndex];

        console.log("         ----------     ")
        console.log(client.playerType)
        console.log("         ----------     ")
        ptIndex++;

    } else if (gameList[currentGameId].players == 1) {

        gameList[currentGameId].players++;
        client.playerType = playerTypes[ptIndex];
        ptIndex++;

    } else if(gameList[currentGameId].players == 2) {

        gameList[currentGameId].players++;
        client.playerType = playerTypes[ptIndex];
        ptIndex++;
        for (var c in clients){
            clients[c].remote.createPlayer2(Math.floor(Math.random()*100000000));
        }

    } else if(gameList[currentGameId].players == 3) {

        gameList[currentGameId].players++;
        client.playerType = playerTypes[ptIndex];
        ptIndex++;

    } else {

        currentGameId++;
        gameList[currentGameId] = {};
        gameList[currentGameId].players = 1;

    }

    // client.remote.interact("chooseRole",client.playerType)
    client.remote.chooseRole(client.playerType)

    client.configured = true;
}

eurecaServer.exports.distribute = function(action,args) {
    for (var c in clients){
        //execute action on client side of all clients
        if (clients[c].configured) {
            clients[c].remote.interact(action,args);
        }
    }
}

eurecaServer.exports.getRole = function() {
    var conn = this.connection;
    var client = clients[conn.id];
    console.log(client.playerType)
    client.remote.interact("chooseRole",client.playerType)
}

eurecaServer.exports.sendReadyState = function(){
    gameList[currentGameId].readyPlayers++;
    console.log("ready",gameList[currentGameId].readyPlayers)
    if(gameList[currentGameId].readyPlayers == 4){
        for (var c in clients){
        //execute action on client side of all clients
            if (clients[c].configured) {
                clients[c].remote.interact("setProp",{
                  prop: "allReady",
                  val: true
                });
                clients[c].remote.interact("removeReadyText",null);
            }
        }
    }
}

//detect client disconnection
eurecaServer.onDisconnect(function (conn) {
    console.log('Client disconnected ', conn.id);
    var removeId = clients[conn.id].id;
    delete clients[conn.id];
    for (var c in clients){
        var remote = clients[c].remote;
        remote.interact('disconnect',null);
    }
});


eurecaServer.exports.playerHandshake = function(){
    for (var c in clients){
        var remote = clients[c].remote;
        for (var cc in clients){
            //send latest known position
            var x = clients[cc].laststate ? clients[cc].laststate.x:  110;
            var y = clients[cc].laststate ? clients[cc].laststate.y:  8880;

            //Spawns an enemy on connect
            //remote.spawnEnemy(clients[cc].id, x, y);
        }
    }
}


//be exposed to client side
//updates the current state of a player when changed
eurecaServer.exports.handleKeys = function (keys) {
    var conn = this.connection;
    var updatedClient = clients[conn.id];
    for (var c in clients){
        var remote = clients[c].remote;
        remote.updateState(updatedClient.id, keys);
    }
    clients[conn.id].laststate = keys;
}

server.listen(process.env.PORT || 8000);