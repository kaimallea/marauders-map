#!/usr/bin/env node

var HTTP_PORT = 1337,
    UDP_PORT = 1338;

var http = require('http'),
    net = require('net'),
    dgram = require('dgram'),
    express = require('express'),
    io = require('socket.io'),
    util = require('util');

var webapp = express();
var httpServer = http.createServer(webapp);
var webSocketServer = io.listen(httpServer);
var udpServer = dgram.createSocket('udp4');


// Keep track of game state, so clients don't have to
var GAME_STATE = {
    t: {
        teamName: '',
        wins: 0
    },

    ct: {
        teamName: '',
        wins: 0
    },

    mapName: '',
    currentRound: 0,
    maxRounds: 0,
    warmup: true,
    halftime: false
};


// Static files (js, css, images, etc.) will be
// served out of "static" folder
webapp.use(express.static(__dirname + '/static'));


// HTTP requests to root should return index.html
webapp.get('/', function (req, res) { res.sendfile(__dirname + '/index.html');
});


// Table of player positions, indexed by id (0-9)
// TODO: player ids can be any number, not just 0-9
var POSITIONS = [
/*
  [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0],
  [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]
*/
];
var positionsUpdated = false;

var tcpServer = net.createServer(function (c) { //tcp server events handled
    c.setKeepAlive(true, 5);
    c.setEncoding('utf-8');
        c.on('connect', function () { //Fires when CS:GO Server connects
            console.log(green('Client connected'));
        });
        c.on('end', function () {     //Fires when CS:GO Server disconnects
            console.log(error('Client disconnected'));
        });
        c.on('data', function (data) {     //On Data, save data to db
            //data = type,timestamp,var1,var2,var3,var4,var5,var6,var7,etc
            // TODO This will be changed, 
            // Proposed format is:
            // Meta document >> Map Document >> Player Document >>
            // Round Document >> Event Document.
            //
            console.log(warn(data));
            //data   = data.toString().split(',');
            var type   = data[0];
            //time   = data[1];
            //plant  = data[2];
            
            switch(type) {      //Different cases, different db writes

                case 're':          //round end
                    winner   = data[3];
                    reason   = data[4];
                    payload  = JSON.stringify(
                    { type: type, time: time, plant: plant, winner: winner, reason: reason }
                    );
                    console.log(warn(payload));
                    payload  = JSON.parse(payload);
                    dbsave(payload);
                    if(winner == 2) {
                        GAME_STATE.t.wins++;
                        console.log(error(GAME_STATE.t.wins));
                    } else if(winner ==3) {
                        GAME_STATE.ct.wins++;
                        console.log(notice(GAME_STATE.ct.wins));
                    }
                break;
                case 'pd':          //player death
                    attacker = data[3];
                    victim   = data[4];
                    ateam    = data[5];
                    vteam    = data[6];
                    weapon   = data[7];
                    headshot = data[8];
                    payload  = JSON.stringify(
                    { type: type, time: time, plant: plant
                    , victim: victim, attacker: attacker
                    , vteam: vteam, ateam: ateam, weapon: weapon, headshot: headshot
                    });
                    console.log(warn(payload));
                payload  = JSON.parse(payload);
                dbsave(payload);
                break;
                case 'ps':          //plant started
                    name     = data[3];
                break;
                    case 'bp':          //bomb planted
                        name     = data[3];
                    payload  = JSON.stringify(
                    { type: type, time: time, plant: plant, name: name } 
                    );
                    console.log(warn(payload));
                    payload  = JSON.parse(payload);
                    dbsave(payload);
                break;
                case 'ds':          //defuse started
                    name     = data[3];
                    site     = data[4];
                    payload  = JSON.stringify(
                    { type: type, time: time, plant: plant, name: name }
                    );
                    console.log(warn(payload));
                    payload  = JSON.parse(payload);
                    dbsave(payload);
                break;
                case 'bd':          //bomb defused
                    name     = data[3];
                break;
               case 'fb':          //player_blind
                    team     = data[4];
                    payload  = JSON.stringify(
                    { type: type, time: time, plant: plant, name: name } 
                    );
                    console.log(warn(payload));
                    payload  = JSON.parse(payload);
                    dbsave(payload);
              break;
              case 'hed':         //hegrenade_detonate
                    name     = data[3];
                    team     = data[4];
                    x        = data[5];
                    y        = data[6];
                    z        = data[7];
                    payload  = JSON.stringify(
                    { type: type, time: time, plant: plant, name: name, team: team, x: x, y: y, z: z }
                    );
                    console.log(warn(payload));
                    payload  = JSON.parse(payload);
                    dbsave(payload);
                break;
              case 'cm':         //current_map
                    map     = data[1];
                    payload  = JSON.stringify(
                    { type: type, map: map}
                    );
                    console.log(warn(payload));
                    payload  = JSON.parse(payload);
                    dbsave(payload);
                    GAME_STATE.mapName = map;
                    console.log(GAME_STATE.mapName);
                break;
                default: 
                    console.log(green('FART'));
            } 
        }); 
    });

dbsave = function (payload){        //DB save function for cases
    db.save(payload,function (err, res) {
    if (err) {
        console.log(error('Error: ', err));
    } else {
        console.log(notice('Saved as', res));
    }
    });
};

// le incoming UDP packets
udpServer.on('message', function (msg, rinfo) {
    var data = msg.toString().split(','),
        eventType = data[0],
        id = parseInt(data[1], 10);

    switch(eventType) {
        // Positions
        case 'p':
            POSITIONS[id] = [ data[2], data[3], data[4], data[5], data[6] ];
            positionsUpdated = true;
            break;
        // Names
        case 'n':
            sendName(id, data[2]); // id, name
            break;
        // Death
        case 'd':
            sendPlayerDeath(id);
            break;
         // Spawn
        case 's':
            sendPlayerSpawn(id);
            break;
        // Low health
        case 'lh':
            sendLowHealth(id);
            break;
        default:
    }
});

udpServer.on('listening', function () {
    console.log('UDP server listening on %d', UDP_PORT);
});

httpServer.listen(HTTP_PORT);
console.log('HTTP server listening on %d', HTTP_PORT);

udpServer.bind(UDP_PORT);

function sendPlayerSpawn(id) {
  webSocketServer.sockets.emit('spawn', JSON.stringify(id));

}

function sendLowHealth(id) {
  webSocketServer.sockets.emit('lowhealth', JSON.stringify(id));
}

function sendPlayerDeath(id) {
  webSocketServer.sockets.emit('death', JSON.stringify(id));
}

function sendName(id, name) {
  webSocketServer.sockets.emit('name', JSON.stringify({id: id, name: name}));
}

function sendPositions() {
  if (positionsUpdated) {
    webSocketServer.sockets.emit('position', JSON.stringify(POSITIONS));
    positionsUpdated = false;
  }
}

setInterval(sendPositions, 1000/33);
