#!/usr/bin/env node

var HTTP_PORT = 1337,
    UDP_PORT = 1338,
    TCP_PORT = 1339;

//Requires
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

// Cradle connection info.
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
      console.log(warn('db does not exist, creating...'));
      db.create();
    }
});

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
            console.log(warn(data));
            data   = data.toString().split(',');
            type   = data[0];
            time   = data[1];
            plant  = data[2];
            
            switch(type) {      //Different cases, different db writes
                case 're':          //round end
                    winner   = data[3]
                    reason   = data[4]
                    payload  = JSON.stringify(
                    { type: type, time: time, plant: plant, winner: winner, reason: reason }
                    );
                    console.log(warn(payload));
                    payload  = JSON.parse(payload);
                    dbsave(payload);
                    if(winner == 2) {
                        GAME_STATE.t.wins++
                        console.log(error(GAME_STATE.t.wins))
                    } else if(winner ==3) {
                        GAME_STATE.ct.wins++
                        console.log(notice(GAME_STATE.ct.wins))
                    }
                break;
                case 'pd':          //player death
                    attacker = data[3]
                    victim   = data[4]
                    ateam    = data[5]
                    vteam    = data[6]
                    weapon   = data[7]
                    headshot = data[8]
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
                    name     = data[3]
                break;
                case 'bp':          //bomb planted
                    name     = data[3]
                    payload  = JSON.stringify(
                    { type: type, time: time, plant: plant, name: name } 
                    );
                    console.log(warn(payload));
                    payload  = JSON.parse(payload);
                    dbsave(payload);
                break;
                case 'ds':          //defuse started
                    name     = data[3]
                    site     = data[4]
                    payload  = JSON.stringify(
                    { type: type, time: time, plant: plant, name: name }
                    );
                    console.log(warn(payload));
                    payload  = JSON.parse(payload);
                    dbsave(payload);
                break;
                case 'bd':          //bomb defused
                    name     = data[3]
                break;
                case 'fb':          //player_blind
                    name     = data[3];
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
            dbsave = function (payload){        //DB save function for cases
                db.save(payload,function (err, res) {
                if (err) {
                    console.log(error('Error: ', err));
                } else {
                    console.log(notice('Saved as', res));
                };
                });
            };
    });

// Handle incoming UDP packets
udpServer.on('message', function (msg, rinfo) {
    var data = msg.toString().split(',');
    switch(data[0]) {
        // Positions
        case 'p':
            //console.log(notice(data));
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

//Set up listens
udpServer.on('listening', function () {
    console.log(notice('UDP') + ' server listening on' + notice(' %d'), UDP_PORT);
});

tcpServer.listen(TCP_PORT, function () {
    console.log(notice('TCP') + ' server listening on' + notice(' %d'), TCP_PORT);
});

httpServer.listen(HTTP_PORT);
console.log(notice('HTTP') + ' server listening on' + notice(' %d'), HTTP_PORT);

udpServer.bind(UDP_PORT);
