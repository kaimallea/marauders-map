/**
 * Represents the data about a 
 * CS:GO player
 *
 */
var Player = Backbone.Model.extend({
    defaults: {
        // In-game name
        name: 'Unknown',

        // client ID
        cd: 0,

        // 0 = Teamless
        // 1 = Spectator
        // 2 = T
        // 3 = CT
        team: 0,

        bomb: 0,

        // Current position on map
        pos: {
            x: 0, y: 0
        }
    },
    
    initialize: function () {
        var team = this.get('team'),
            markerImg = ['', '', 't_marker.svg', 'ct_marker.svg'];

        this.set('marker', MAP.image('../img/' + markerImg[team], 0, 0, 8, 10).attr({opacity:0}));
        this.on('change', function () { this.draw(); });
        this.draw();
    },


    opacity: function () {
        if (this.isDead()) {
            return 0.5;
        }

        var opacity = [0, 0, 1, 1],
            team = this.get('team');

        return opacity[team];
    },


    color: function () {
        if (this.isDead()) {
            return 'gray';
        }

        var color = ['', '', 'red', 'blue'],
            team = this.get('team');

        return color[team];  
    },


    hasBomb: function () {
        return this.get('bomb');
    },


    isDead: function () {
        return this.get('dead');
    },


    scalePosition: function () {
        var pos = this.get('pos');
        
        // Reverse y
        pos.y = -pos.y;

        pos.x += 4096;
        pos.y += 4096;
        pos.x /= 8;
        pos.y /= 8;
    
        // azk-level accuracy
        pos.x *= 1.035;
        pos.y *= 1.035;

        return pos;
    },


    // Update marker
    draw: function () {
        var attrs = {
            opacity: this.opacity(),
            fill: this.color()
        }

        if (!this.isDead()) {
            var pos = this.scalePosition();
            attrs.x = pos.x - this.get('marker').width;
            attrs.y = pos.y - this.get('marker').height;
        }

        //console.log(attrs);

        this.get('marker').animate(attrs, 200, 'ease-int-out');
    }
});


/**
 * Represents a collection of Players
 *
 */
var PlayerCollection = Backbone.Collection.extend({
    model: Player
});
