/**
 * Marauder's Map
 */
(function (global) {
    'use strict';

    var SVGDOC      = document.getElementById('map').getSVGDocument(), // #Document
        T_MARKER    = SVGDOC.getElementById('t'), // <g id="t">...</g>
        CT_MARKER   = SVGDOC.getElementById('ct'); // <g id="ct">...</g>

    var EVENTS_WORKER = new Worker('/js/workers/events-worker.js');


    function init () {
        EVENTS_WORKER.addEventListener('position', updatePosition);
        EVENTS_WORKER.addEventListener('', updatePosition);
    }

    init();

}(this));