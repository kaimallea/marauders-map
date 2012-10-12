var SOCKET_IO_HOST  = '198.74.56.175',
    SOCKET;


// Callback when positions are updated
function onPositionUpdate (data) {
    var i = data.pos.length;
    while (i >= 0) {
        var id = data.pos[i].id,
            dataset = data.pos[i];

        if ((var p = PLAYERS_INDEX[id])) {
            p.updatePosition(dataset);
        } else {
            PLAYERS_INDEX[id] = new Player(dataset);
        }

        --i;
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