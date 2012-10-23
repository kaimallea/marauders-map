#!/usr/bin/env node

var HTTP_PORT = 1337;

var http = require('http'),
    net = require('net'),
    express = require('express'),
    webapp = express(),
    server = http.createServer(webapp);

// Static files (js, css, images, etc.) will be
// served out of "static" folder
webapp.use(express.static(__dirname + '/static'));


// HTTP requests to root should return index.html
webapp.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

console.log('Listening on %d', HTTP_PORT);

server.listen(HTTP_PORT);