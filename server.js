#!/usr/bin/env node

var HTTP_PORT = 1337,
    UDP_PORT = 1338;

var http = require('http'),
    dgram = require('dgram'),
    express = require('express'),
    io = require('socket.io'),
    util = require('util');
    // cradle = require('cradle'),
    // clc = require('cli-color');

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

// Cli-color styling
// var error = clc.red;
// var warn = clc.yellow;
// var notice = clc.blue;
// var green = clc.green;

// Some couch/cradle specific vars
// cradle.setup({
//     host: '192.168.234.92',
//     cache: true,
//     raw: false,
//     });
// 
// var c = new(cradle.Connection);
// var db = c.database('google-strike');
// 
// // Checks if db exists, if not, creates.
// db.exists(function(err, exists) {
//     if (err) {
//         console.log('Error:', err);
//     } else if (exists) {
//       console.log(error('Lights...') + '    ' + warn('Camera...') + '    ' + green('Counter!'));
//     } else {
//       console.log(warning('db does not exist, creating...'));
//       db.create();
//     }
// });

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
        // case 'r':
        //     console.log(error(data));
        //     break;

        // Unknown
        default:
    }
});

udpServer.on('listening', function () {
    console.log(notice('UDP') + ' server listening on' + notice(' %d'), UDP_PORT);
});

httpServer.listen(HTTP_PORT);
console.log(notice('HTTP') + ' server listening on' + notice(' %d'), HTTP_PORT);

udpServer.bind(UDP_PORT);

function sendPositions() {
  webSocketServer.sockets.emit('position', JSON.stringify(POSITIONS));
}

setInterval(sendPositions, 1000/33);
