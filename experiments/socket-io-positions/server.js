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

httpServer = http.createServer(webapp);
webSocketServer = io.listen(httpServer);
tcpServer = net.createServer(function (socket) {
	socket.setKeepAlive(true, 5);
	socket.setEncoding('utf-8');
	socket.on('data', dataProcessor);
});

var dataProcessor = function (data) {
	console.log(data);
};

// HTTP requests for static files should match file
// inside of ./static
webapp.use(express.static(__dirname + '/static'));

// HTTP requests to / should return index.html
webapp.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

webSocketServer.sockets.on('connection', function (socket) {
    socket.emit('news', {hello: 'world'});
});


/**
 * Start HTTP and TCP servers
 */
httpServer.listen(HTTP_PORT);
tcpServer.listen(TCP_PORT);
