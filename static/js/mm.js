/**
 * Marauder's Map
 */
(function (global) {
    'use strict';

    // Global object in browser
    var MM = global.MM = global.MM || {};

    // Globals inside this anonymous func
    var SVGDOC, DEFS, T_MARKER, CT_MARKER, PLAYERS = [];


    function updatePosition(message) {
        var data    = message.data.split(','),
            id      = data[0],
            team    = data[1],
            bomb    = data[2],
            x       = data[3],
            y       = data[4],
            z       = data[5],
            yaw     = data[6];

        if (!PLAYERS[id]) {
            PLAYERS[id] = MM.createPlayer({
                id: id,
                team: team
            });
            return;
        }

        requestAnimationFrame(function() {
            PLAYERS[id].moveTo(x, y, yaw);//.rotate(yaw);
        });
    }


    function init() {
        // Get references to elements in SVG doc
        SVGDOC      = document.getElementById('map')
                        .getSVGDocument() // #Document
                        .getElementsByTagName('svg')[0]; // <svg>...</svg>

        DEFS        = SVGDOC.getElementById('defs'); // <defs>...</defs>
        T_MARKER    = SVGDOC.getElementById('t-marker'); // <g id="t-marker">...</g>
        CT_MARKER   = SVGDOC.getElementById('ct-marker'); // <g id="ct-marker">...</g>
        PLAYERS     = SVGDOC.getElementById('players'); // <g id="players">...</g>

        // Create and start worker
        var positionWorker = new Worker('/js/SocketIOClient.js')
                                .addEventListener('message', updatePosition, false);

	
        // requestAnimationFrame all the things!
        // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
        window.requestAnimationFrame = (function() {
            return window.requestAnimationFrame ||
                   window.webkitRequestAnimationFrame ||
                   window.mozRequestAnimationFrame ||
                   window.oRequestAnimationFrame ||
                   window.msRequestAnimationFrame ||
                   function(callback) {
                       window.setTimeout(callback, 1000/60);
                   };
        })();

        console.log('MM initialized');

    }


    /**
     * Create a new element with optional attributes
     *
     */
    function createEl (type, attrs) {
        type = type.toLowerCase();

        var el = document.createElementNS('http://www.w3.org/2000/svg', type);

        if (typeof attrs === 'object') {
            Object.keys(attrs).forEach(function (k) {
                switch (k) {
                    case 'xlink:href':
                        el.setAttributeNS('http://www.w3.org/1999/xlink', k, attrs[k]);
                        break;
                    default:
                        el.setAttribute(((k === 'className') ? 'class' : k), attrs[k]);
                }
            });
        }

        return el;
    }


    /**
     * Player constructor
     *
     */
    function MMPlayer(options) {
        options.name = options.name || options.team.toUpperCase();
        options.id = 'id' + options.id;

        var group   = createEl('g', {id: options.id});
        this.markerEl = createEl('use', {'xlink:href': '#' + options.team + '-marker', className: options.team});
        this.nameEl    = createEl('text', {x: 0, y: 135, className: 'name'});
        this.nameEl.textContent = options.name;

        group.appendChild(this.markerEl);
        group.appendChild(this.nameEl);

        DEFS.appendChild(group);

        this.el = createEl('use', {'xlink:href': '#' + options.id});

        PLAYERS.appendChild(this.el);
    }

    // Methods and properties available to all MMPlayer instances
    MMPlayer.prototype = {
        rotate: function (D) { // Rotate the marker by D degrees
            this.markerEl.setAttribute('transform', 'rotate(' + D + ')');
            return this;
        },

        moveTo: function (x, y, yaw) { // Translate player group to x,y position
            this.el.setAttribute('transform', 'translate(' + x + ',' + y + ') rotate(' + yaw + ')');
            return this;
        },

        setName: function (name) { // Set name of player
            this.nameEl.textContent = name;
            return this;
        }
    };


    /**
     * Create and return a new MMPlayer instance
     */
    function createPlayer(options) {
        return new MMPlayer(options);
    }


    // Methods available on the global "MM" object
    MM.init = init;
    MM.createPlayer = createPlayer;
}(this));
