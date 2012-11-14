/**
 * This file is a web worker
 */
importScripts('/socket.io/socket.io.js');


// Callback when positions are updated
function onPositionUpdate (data) {
    data = JSON.parse(data);
    
    var id = 9;
    while (id > 0) {
        //data[id][team,x,y,z,yaw];
        var team = data[id][0],
            y    = data[id][2],
            yaw  = data[id][4],
            offsetY = 3380;

        // normalize team
        team = parseInt(team, 10);
        if (team === 2) {
            team = 't';
        } else if (team === 3) {
            team = 'ct';
        } else {
            continue;
        }
 
        data[id][0] = team;

        // normalize y
        if (y < 0) {
            y = Math.abs(y) + (offsetY * 2);
        } else {
            y = offsetY + (offsetY - y);
        }
        data[id][2] = y;

        // normalize yaw
        yaw = -yaw + 90;
        data[id][4] = yaw;

        id--;
    }

    postMessage(JSON.stringify(data));
}

// Initialize web socket communication
(function initSocket () {
    io.connect('http://' + location.hostname)
        .on('position', onPositionUpdate);
}());
