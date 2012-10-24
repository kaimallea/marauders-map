/**
 * Server ports
 */
var HTTP_PORT = 1337,
    TCP_PORT = 1338,
    DB_PORT = 5984; //default couch port, might want to change later
/**
 * Required includes
 */
var http = require('http'),
    net = require('net'),
    express = require('express'),
    webapp = express(), // func call
    io = require('socket.io'),
    cradle = require('cradle'),
    clc = require('cli-color');

var httpServer = http.createServer(webapp);
var webSocketServer = io.listen(httpServer);
var tcpServer = net.createServer(function (socket) {
    socket.setKeepAlive(true, 5);
    socket.setEncoding('utf-8');
    socket.on('data', dataProcessor);
});

//cli-color styling
var error = clc.red.bold;
var warn = clc.yellow;
var notice = clc.blue;

//some couch/cradle specific vars
cradle.setup({
    host: '192.168.234.92',
    cache: true,
    raw: false,
    });

var c = new(cradle.Connection);
var db = c.database('google-strike');

//checks if db exists, if not, creates.
db.exists(function(err, exists) {
    if (err) {
        console.log('error', err);
    } else if (exists) {
      console.log(notice('Lights, Camera, Counter!'));
    } else {
      console.log(warning('db does not exist, creating...'));
      db.create();
    }
});


var buffer = ''; // buffer for incoming packet data
var dataProcessor = function (data) {
    buffer += data.toString(); // convert incoming data to a string and store in buffer

    // since the connection stays open we need to check for \r\n
    // to know when a packet is complete
    var packetEnd = buffer.indexOf('\r\n');
    if (packetEnd !== -1) {  // there's a complete packet in the buffer
        var json = buffer.slice(0, packetEnd); // extract complete part (which should be parsable json)
        buffer = buffer.slice(packetEnd+2); // chop off completed packet from buffer

        try {
            json = JSON.parse(json);
        } catch (e) {
            console.log('Bad json.\nAttempted to parse: ' + json + '\nCaptured Error: ' + e);
            return;
        }

        db.save(json, function (err, res) {
                if (err) {
                    console.log(error('error', err));
                } else {
                    console.log(notice('Saved as', res));
                }
        });

        var key = Object.getOwnPropertyNames(json)[0];
        switch (key) {
            case 'pos':
                webSocketServer.sockets.emit('positions', json);
                break;
            case 'names':
                webSocketServer.sockets.emit('names', json);
                break;
        }

        console.log(json);
    }
};

// HTTP requests for static files should match file
// inside of ./static
webapp.use(express.static(__dirname + '/static'));

// HTTP requests to / should return index.html
webapp.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

webSocketServer.sockets.on('connection', function (socket) {
    //socket.emit('news', {hello: 'world'});
});


/**
 * Start HTTP and TCP servers
 */
httpServer.listen(HTTP_PORT);
tcpServer.listen(TCP_PORT);
