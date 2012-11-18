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
     * Handle incoming events from web worker
     */
    function onEventData(message) {
      message = JSON.parse(message.data);

      switch(message.type) {
        case 'position':
          updatePosition(message.data);
          break;
        case 'name':
          updateName(message.data);
          break;
        case 'death':
          playerDeath(message.data);
          break;
        case 'spawn':
          playerSpawn(message.data);
          break;
        case 'lowhealth':
          playerLowHealth(message.data);
          break;
        default:
      }
    }


    /**
     * Update positions of all players
     */
    function updatePosition (data) {

      requestAnimationFrame(function() {
          var id = 9;
          /**
           * data[id][0] -> team ('ct' or 't')
           * data[id][1] -> x
           * data[id][2] -> y
           * data[id][3] -> z
           * data[id][4] -> yaw
           */
          while (id > 0) {
            if (!PLAYERS[id]) { // Check if this player is new
                PLAYERS[id] = MM.createPlayer({
                    id: id,
                    team: data[id][0]
                });
            }

            PLAYERS[id]
              .moveTo(data[id][1], data[id][2]) // translate to x,y
              .rotate(data[id][4]);                // rotate by yaw

            id--;
          }
      });
    }


    /**
     * Update player name
     */
    function updateName(data) {
      if (PLAYERS[data.id]) {
        PLAYERS[data.id].setName(data.name)
      }
    }


    /**
     * Player died
     */
    function playerDeath(id) {
      if (PLAYERS[id]) {
        PLAYERS[id].dead();
        PLAYERS[id].fullHealth() // remove low health animation when dead
      }
    }


    /**
     * Player (re)spawned
     */
    function playerSpawn(id) {
      if (PLAYERS[id]) {
        PLAYERS[id].alive();
      }
    }


    /**
     * Set player as having low health
     */
    function playerLowHealth(id) {
      if (PLAYERS[id]) {
        PLAYERS[id].lowHealth();
      }
    }

    /**
     * Callback when the page's visibilty changes
     */
    function handleVisibilityChange() {
      if (document.hidden || document.webkitHidden || document.mozHidden || document.msHidden) {

        // Go Green. Terminate the workers when the page is hidden
        positionWorker.terminate();

      } else {

        // Restart workers when page is unhidden
        positionWorker = new Worker('/js/SocketIOClient.js');
        positionWorker.addEventListener('message', onEventData, false);

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

        // Create and start workers
        positionWorker = new Worker('/js/SocketIOClient.js');
        positionWorker.addEventListener('message', onEventData, false);


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


    /**
     * Methods and properties available to all MMPlayer instances
     */

    // Rotate the marker by D degrees
    MMPlayer.prototype.rotate = function (D) {
      this.markerEl.setAttribute('transform', 'rotate(' + D + ')');
      return this;
    };

    // Translate player group to x,y position
    MMPlayer.prototype.moveTo = function (x, y) {
      this.el.setAttribute('transform', 'translate(' + x + ',' + y + ')');
      return this;
    };

    // Set name of player
    MMPlayer.prototype.setName = function (name) {
      this.nameEl.textContent = name;
      return this;
    };

    // Set player as being dead
    MMPlayer.prototype.dead = function () {
      this.el.classList.add('dead');
      return this;
    };

    // Set player as being alive
    MMPlayer.prototype.alive = function () {
      this.el.classList.remove('dead');
      return this;
    };

    // Set player as having low health
    MMPlayer.prototype.lowHealth = function () {
      this.markerEl.classList.add('low-health');
      return this;
    };

    // Set player as having full health
    MMPlayer.prototype.fullHealth = function () {
      this.markerEl.classList.remove('low-health');
      return this;
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
