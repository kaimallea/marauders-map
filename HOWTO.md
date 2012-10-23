This experiment is a Node.js app that is two servers in one:

 - Web server

 - TCP server


The CS:GO server plugin (`pos_tracker.sp`) in this experiment sends all player's positions (individually) to the TCP server every 3 seconds (port 1338), in JSON format.

Clients (web browsers) can access the front end via port 1337 at the same address it's hosted on, and will receive push updates from the server (via socket.io)

---

To use this Node.js app, first install Node.js (http://nodejs.org/)

Once Node.js is installed, enter this directory and type the following:

```shell
npm install express
npm install socket.io
```

This will install the dependencies into a `node_modules` directory.


Then execute the server by typing:

```shell
node server.js
```
