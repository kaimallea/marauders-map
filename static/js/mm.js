/**
 * Marauder's Map
 */
(function (global) {
    'use strict';
/*
    var SVGDOC      = document.getElementById('map').getSVGDocument(), // #Document
        T_MARKER    = SVGDOC.getElementById('t'), // <g id="t">...</g>
        CT_MARKER   = SVGDOC.getElementById('ct'); // <g id="ct">...</g>
*/
    var positionWorker = new Worker('/js/SocketIOClient.js');


    function updatePosition(message) {
        console.log(message.data);
    }


    function init () {
        positionWorker.addEventListener('message', updatePosition, false);
    }

    init();

}(this));