/**
 * Marauder's Map
 */
(function (global) {
    'use strict';

    // Global object in browser
    var MM = global.MM = global.MM || {};

    // Globals inside this anonymous func
    var SVGDOC, T_MARKER, CT_MARKER, PLAYERS = [];
    var positionWorker;


    /**
     * Update positions of all players
     */
    function updatePosition(message) {
      message = JSON.parse(message.data);

      requestAnimationFrame(function() {
          var id = 9;
          /**
           * message[id][0] -> team ('ct' or 't')
           * message[id][1] -> x
           * message[id][2] -> y
           * message[id][3] -> z
           * message[id][4] -> yaw
           */
          while (id > 0) {
            if (!PLAYERS[id]) { // Check if this player is new
                PLAYERS[id] = MM.createPlayer({
                    id: id,
                    team: message[id][0]
                });
            }

            PLAYERS[id]
              .moveTo(message[id][1], message[id][2])
              .rotate(message[id][4]);

            id--;
          }
      });
    }


    /**
     * Callback when the page's visibilty changes
     */
    function handleVisibilityChange() {
      if (document.hidden || document.webkitHidden || document.mozHidden || document.msHidden) {
        // Go Green. Terminate the worker when the page is hidden
        positionWorker.terminate();
      } else {
        // Restart worker when page is unhidden
        positionWorker = new Worker('/js/SocketIOClient.js');
        positionWorker.addEventListener('message', updatePosition, false);
      }
    }


    /**
     * Initialization, called when page is done loading
     */
    function init() {
        // Get references to elements in SVG doc
        SVGDOC      = document.getElementById('map')
                        .getSVGDocument() // #Document
                        .getElementsByTagName('svg')[0]; // <svg>...</svg>

        T_MARKER    = SVGDOC.getElementById('t-marker'); // <g id="t-marker">...</g>
        CT_MARKER   = SVGDOC.getElementById('ct-marker'); // <g id="ct-marker">...</g>
        PLAYERS     = SVGDOC.getElementById('players'); // <g id="players">...</g>

        // Create and start worker
        positionWorker = new Worker('/js/SocketIOClient.js');
        positionWorker.addEventListener('message', updatePosition, false);

        // requestAnimationFrame all the things!
        // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
        window.requestAnimationFrame = (function() {
            return window.requestAnimationFrame ||
                   window.webkitRequestAnimationFrame ||
                   window.mozRequestAnimationFrame ||
                   window.oRequestAnimationFrame ||
                   window.msRequestAnimationFrame ||
                   function(callback) {
                       window.setTimeout(callback, 1000/33);
                   };
        })();

        console.log('MM initialized');

        // Setup page visibility handler, if supported
        var isHiddenSupported = typeof (document.hidden || document.webkitHidden || document.mozHidden || document.msHidden);
        if (typeof isHiddenSupported !== 'undefined') {
          document.addEventListener('visibilitychange', handleVisibilityChange, false);
          document.addEventListener('webkitvisibilitychange', handleVisibilityChange, false);
          document.addEventListener('mozvisibilitychange', handleVisibilityChange, false);
          document.addEventListener('msvisibilitychange', handleVisibilityChange, false);
        }
    }


    /**
     * Create a new SVG element with optional attributes
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
     * MMPlayer constructor
     * Each instance of MMPlayer represents a single player
     */
    function MMPlayer(options) {
        options.name = options.name || options.team.toUpperCase();
        options.id = 'id' + options.id;

        /**
         * Goal is to:
         *
         * 1. Create:
         *
         * <g id="#n">
         *   <use xlink:href="#(ct|t)-marker" class="(ct|t)"></use>
         *   <text x="0" y="135" class="name">Player name</text>
         * </g>
         *
         * 2. Append to <g id="players>...</g> in SVGDOC
         */
        var group = this.el = createEl('g', {id: options.id});
        this.markerEl = createEl('use', {'xlink:href': '#' + options.team + '-marker', className: options.team});
        this.nameEl    = createEl('text', {x: 0, y: 135, className: 'name'});
        this.nameEl.textContent = options.name;

        group.appendChild(this.markerEl);
        group.appendChild(this.nameEl);

        PLAYERS.appendChild(group);
    }

    // Methods and properties available to all MMPlayer instances
    MMPlayer.prototype = {
        rotate: function (D) { // Rotate the marker by D degrees
            this.markerEl.setAttribute('transform', 'rotate(' + D + ')');
            return this;
        },

        moveTo: function (x, y) { // Translate player group to x,y position
            this.el.setAttribute('transform', 'translate(' + x + ',' + y + ')');
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


    // Publicly available methods, accessible via the global "MM" object
    MM.init = init;
    MM.createPlayer = createPlayer;
}(this));
