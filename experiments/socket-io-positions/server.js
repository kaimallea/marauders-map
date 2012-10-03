/**
 * Server ports
 */
var HTTP_PORT = 1337,
    TCP_PORT = 1338;

/**
 * Required includes
 */
var http = require('http'),
    net = require('net'),
    express = require('express'),
    webapp = express(), // func call
    io = require('socket.io');

var httpServer = http.createServer(webapp);
var webSocketServer = io.listen(httpServer);
var tcpServer = net.createServer(function (socket) {
    socket.setKeepAlive(true, 5);
    socket.setEncoding('utf-8');
    socket.on('data', dataProcessor);
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

        webSocketServer.sockets.emit('positions', json);

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
