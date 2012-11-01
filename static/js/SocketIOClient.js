/**
 * This file is a web worker
 */
importScripts('/socket.io/socket.io.js');


// Callback when positions are updated
function onPositionUpdate (data) {
    data = data.split(',');

    var team = data[1],
        y    = data[4],
        yaw  = data[6],
        offsetY = 3380;

    // normalize team
    team = parseInt(team, 10);
    if (team === 2) {
        team = 't';
    } else if (team === 3) {
        team = 'ct';
    } else {
        return
    }
    
    data[1] = team;

    // normalize y
    if (y < 0) {
        y = Math.abs(y) + (offsetY * 2);
    } else {
        y = offsetY + (offsetY - y);
    }
    data[4] = y;

    // normalize yaw
    yaw = -yaw + 90;
    data[6] = yaw;

    postMessage(data.join(','));

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
function onNameUpdate (data) {
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
        .on('names', onNameUpdate);
}());