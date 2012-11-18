#!/usr/bin/env node

var HTTP_PORT = 1337,
    UDP_PORT = 1338;

var http = require('http'),
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
