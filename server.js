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
webapp.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});


// Handle incoming UDP packets
udpServer.on('message', function (msg, rinfo) {
    var data = msg.toString().split(',');

    switch(data[0]) {
        // Positions
        case 'p':
            webSocketServer.sockets.emit('position',
                // id,team,bomb,x,y,z,yaw
                util.format('%d,%d,%d,%f,%f,%f,%f', data[1], data[2], data[3], data[4], data[5], data[6], data[7])
            );
            break;

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
