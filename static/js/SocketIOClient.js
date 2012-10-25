/**
 * This file is a web worker
 */
importScripts('/socket.io/socket.io.js');

addEventListener('message', function (e) {
    var data = e.data;
    switch (data.cmd) {
        case 'start':
            initSocket();
            break;
        default:
            break;
    }
});


// Callback when positions are updated
function onPositionUpdate (data) {
    postMessage(data);
    return;
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

// Callback when names are broadcasted
function onNamesUpdate (data) {
    var len;
    if ( !(len = data.names.length) ) { return; }

    while (len >= 1) {
        var id = data.names[len-1].id,
            name = data.names[len-1].name,
            p = PLAYERS_INDEX[id];

        if (p) {
            p.setName(name);
        }

        --len;
    }
}


// Initialize web socket communication
(function initSocket () {
    io.connect('http://' + location.hostname)
        .on('position', onPositionUpdate)
        .on('names', onNamesUpdate);
}());
