/**
 * Marauder's Map
 */
(function (global) {
    'use strict';

    var MM = global.MM = global.MM || {};

    var SVGDOC, DEFS, MARKER, PLAYERS;

    //var positionWorker = new Worker('/js/SocketIOClient.js');


    function updatePosition(message) {
        //console.log(message.data);
    }


    function init() {
        // Get references to elements in SVG doc
        SVGDOC  = document.getElementById('map')
                    .getSVGDocument() // #Document
                    .getElementsByTagName('svg')[0], // <svg>...</svg>
        DEFS    = SVGDOC.getElementById('defs'); // <defs>...</defs>
        MARKER  = SVGDOC.getElementById('marker'); // <g id="marker">...</g>
        PLAYERS = SVGDOC.getElementById('players'); // <g id="players">...</g>

        // Start worker
        //positionWorker.addEventListener('message', updatePosition, false);

        var p = MM.createPlayer({id: 1, team: 'ct'});
        p.setName('Obama');
        p.moveTo(-421.77, 6459.80);
        p.rotate(90);

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
        options.name = options.name || 'Unknown';
        options.id = 'id' + options.id;

        var group   = createEl('g', {id: options.id});
        this.markerEl = createEl('use', {'xlink:href': '#marker', className: options.team});
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
        },

        moveTo: function (x, y) { // Translate player group to x,y position
            this.el.setAttribute('transform', 'translate(' + x + ',' + y + ')');
        }

        setName: function (name) { // Set name of player
            this.nameEl.textContent = name;
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