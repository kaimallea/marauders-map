var SOCKET_IO_HOST  = '198.74.56.175',
    SOCKET;


// Callback when positions are updated
function onPositionUpdate (data) {
    var len;
    if ( !(len = data.pos.length) ) { return; }

    while (len >= 1) {
        var id = data.pos[len-1].id,
            dataset = data.pos[len-1],
            p = PLAYERS_INDEX[id];

        if (p) {
            p.updatePosition(dataset);
        } else {
            PLAYERS_INDEX[id] = new Player(dataset);
        }

        --len;
    }    
}


// Initialize web socket communication
function initSocket () {
    SOCKET = io.connect('http://' + SOCKET_IO_HOST);

    // Listen for position updates
    SOCKET.on('positions', onPositionUpdate);

    // Listen for name changes
    //SOCKET.on('names', onNameUpdate);
}

initSocket();