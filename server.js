#!/usr/bin/env node

var HTTP_PORT = 1337,
    UDP_PORT = 1338,
    TCP_PORT = 1339;

//requires
var http = require('http'),
    net = require('net'),
    dgram = require('dgram'),
    express = require('express'),
    io = require('socket.io'),
    util = require('util'),
    cradle = require('cradle'),
    clc = require('cli-color'),
    irc = require('irc');

var webapp = express();
var httpServer = http.createServer(webapp);
var webSocketServer = io.listen(httpServer);
var udpServer = dgram.createSocket('udp4');

var tcpServer = net.createServer(function (c) { //tcp server events handled
    c.setKeepAlive(true, 5);
    c.setEncoding('utf-8');
    c.on('connect', function () {
        console.log(green('Client connected'));
    });
    c.on('end', function () {
        console.log(error('Client disconnected'));
    });
    c.on('data', function (data) {
        console.log(warn(data));
    }); 
});

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

// Cli-color styling
var error = clc.red;
var warn = clc.yellow;
var notice = clc.blue;
var green = clc.green;

// Some couch/cradle specific vars
cradle.setup({
    host: '192.168.234.92',
    cache: true,
    raw: false,
    });

var c = new(cradle.Connection);
var db = c.database('google-strike');

// Checks if db exists, if not, creates.
db.exists(function(err, exists) {
    if (err) {
        console.log('Error:', err);
    } else if (exists) {
      console.log(error('Lights...') + '    ' + warn('Camera...') + '    ' + green('Counter!'));
    } else {
      console.log(warning('db does not exist, creating...'));
      db.create();
    }
});

// Database save method
//
// 
//
//db.save(json, function (err, res) {
//    if (err) {
//      console.log(error('error', err));
//    } else {
//        console.log(notice('Saved as', res));
//    }
//  });

// Handle incoming TCP packets


// Handle incoming UDP packets
udpServer.on('message', function (msg, rinfo) {
    var data = msg.toString().split(',');
    switch(data[0]) {
        // Positions
        case 'p':
            console.log(notice(data));
            //webSocketServer.cs.emit('position',
            // id,team,bomb,x,y,z,yaw
            //util.format('%d,%d,%d,%f,%f,%f,%f', data[1], data[2], data[3], data[4], data[5], data[6], data[7])
            //);
            
            break;
        
        case 'r':
            
            console.log(error(data));
            break;

        case 'm':
            
            console.log(green(data));
            break;
        // Unknown
        default:
    }
});

udpServer.on('listening', function () {
    console.log(notice('UDP') + ' server listening on' + notice(' %d'), UDP_PORT);
});

tcpServer.listen(TCP_PORT, function () {
    console.log(notice('TCP') + ' server listening on' + notice(' %d'), TCP_PORT);
});

httpServer.listen(HTTP_PORT);
console.log(notice('HTTP') + ' server listening on' + notice(' %d'), HTTP_PORT);

udpServer.bind(UDP_PORT);
