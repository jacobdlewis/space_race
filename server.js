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
var games = [
    {
        readyPlayers: 0
    }
]
//get EurecaServer class
var EurecaServer = require('eureca.io').EurecaServer;

var occupants = {}

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

    currgame = games[0];
    console.log(currgame)

    var anyonehere = false
    for (var key in occupants) {
        if (occupants[key]!="vacant") {
            anyonehere = true;
            break;
        }
    }

    if (!currgame || !anyonehere) {
        games[0] = {
            readyPlayers: 0
        }
        for (var i=0;i<playerTypes.length;i++) {
            occupants[playerTypes[i]] = "vacant";
        }
    }

    if (occupants[playerTypes[0]]=="vacant") {
        
        occupants[playerTypes[0]] = client;
        client.playerType = playerTypes[0];

    } else if (occupants[playerTypes[1]]=="vacant") {

        occupants[playerTypes[1]] = client;
        client.playerType = playerTypes[1];

    } else if(occupants[playerTypes[2]]=="vacant") {

        occupants[playerTypes[2]] = client;
        client.playerType = playerTypes[2];
        for (var c in clients){
            clients[c].remote.createPlayer2(Math.floor(Math.random()*100000000));
        }

    } else if(occupants[playerTypes[3]]=="vacant") {

        occupants[playerTypes[3]] = client;
        client.playerType = playerTypes[3];

    } else {
     //   alert("too many people, please come back later")
    }
    // client.remote.interact("chooseRole",client.playerType)
    client.remote.chooseRole(client.playerType)

    occupants[client.playerType] = conn.id

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
    games[0].readyPlayers++;
    console.log("ready",games[0].readyPlayers)
    if(games[0].readyPlayers == 4){
        for (var c in clients){
        //execute action on client side of all clients
            if (clients[c].configured) {
                clients[c].remote.interact("setProp",{
                  prop: "allReady",
                  val: true
                });
                clients[c].remote.interact("removeReadyText",null);
                clients[c].remote.interact("setProp",{
                  prop: "gameStarted",
                  val: true
                });
            }
        }
    }
}

//detect client disconnection
eurecaServer.onDisconnect(function (conn) {
    console.log('Client disconnected ', conn.id);

    //games[0].readyPlayers--;
    occupants[clients[conn.id].playerType] = "vacant";

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