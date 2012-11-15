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



// Table of player names, indexed by id
// TODO: Names can be indexed by any number, not just 0-9
var NAMES = ['','','','','','','','','',''];
var namesUpdated = false;

// Table of player positions, indexed by id (0-9)
// TODO: player ids can be any number, not just 0-9
var POSITIONS = [
  [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0],
  [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]
];

// le incoming UDP packets
udpServer.on('message', function (msg, rinfo) {
    var data = msg.toString().split(',');

    switch(data[0]) {
        // Positions
        case 'p':
            POSITIONS[ data[1] ] = [ data[2], data[3], data[4], data[5], data[6] ];
            break;
        case 'n':
            var id = 10;
            while (i > 1) {
              NAMES[id] = data[id];
              --id;
            }
            namesUpdated = true;
            break;
        // case 'r':
        //     console.log(error(data));
        //     break;

        // Unknown
        default:
    }
});

udpServer.on('listening', function () {
    console.log('UDP server listening on %d', UDP_PORT);
});

httpServer.listen(HTTP_PORT);
console.log('HTTP server listening on %d', HTTP_PORT);

udpServer.bind(UDP_PORT);

function sendNames() {
  if (namesUpdated) {
    webSocketServer.sockets.emit('names', JSON.stringify(NAMES));
    namesUpdated = false;
  }
}

function sendPositions() {
  webSocketServer.sockets.emit('position', JSON.stringify(POSITIONS));
}

setInterval(sendPositions, 1000/33);
setInterval(sendNames, 1000*10);
