/**
 * Represents the data about a 
 * CS:GO player
 *
 */
var Player = Backbone.Model.extend({
    defaults: {
        // In-game name
        name: 'Unknown',

        // 0 = Teamless
        // 1 = Spectator
        // 2 = T
        // 3 = CT
        team: 0,

        // Current position on map
        position: {
            x: 0, y: 0, z: 0
        }
    },
    
    initialize: function () {
        this.set('marker', MAP.circle(0, 0, 5).attr({opacity:0}));
        this.on('change', function () { this.draw(); });
        this.draw();
    },

    opacity: function () {
        var opacity = [0, 0, 1, 1],
            team = this.get('team');

        return opacity[team];
    },

    color: function () {
        var color = ['', '', 'red', 'blue'],
            team = this.get('team');

        return color[team];  
    },

    scaledPosition: function (scale) {
        var pos = this.get('position');
        scale = scale || 16;

        return {
            x: (pos.x / 16),
            y: (pos.y / 16)
        }
    },

    draw: function () {
        var pos = this.scaledPosition();

        this.get('marker').attr({
            opacity: this.opacity(),
            fill: this.color(),
            cx: pos.x,
            cy: pos.y
        });
    }

});


/**
 * Represents a collection of Players
 *
 */
var PlayerCollection = Backbone.Collection.extend({
    model: Player
});


