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

        // yaw
        y: 0,

        // Current position on map
        pos: {
            x: 0, y: 0
        }
    },
    
    initialize: function () {
        var team = this.get('team'),
            markerImg = [
                'http://socialpie.org:1337/img/t_marker.svg',
                'http://socialpie.org:1337/img/t_marker.svg',
                'http://socialpie.org:1337/img/t_marker.svg',
                'http://socialpie.org:1337/img/ct_marker.svg'
            ];

        this.set('marker', MAP.image(markerImg[team], 0, 0, 10, 12).attr({opacity:0}));
        //this.set('marker', MAP.circle(0, 0, 5).attr({opacity:0}));
        this.on('change', function () { this.draw(); });
        this.draw();
    },


    opacity: function () {
        if (this.isDead()) {
            return 0.3;
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
            var yaw = this.get('y');
            
            yaw = -yaw;
            yaw += 90;

            //this.get('marker').translate(pos.x, pos.y);
            //attrs.cx = pos.x;
            //attrs.cy = pos.y;
            attrs.x = pos.x - 10;
            attrs.y = pos.y - 12;
            attrs.transform = 'r' + yaw;
            //console.log(pos.x, pos.y, yaw);
        }

        //console.log(attrs);

        this.get('marker').animate(attrs, 200, 'ease-in-out');
    }
});


/**
 * Represents a collection of Players
 *
 */
var PlayerCollection = Backbone.Collection.extend({
    model: Player
});
