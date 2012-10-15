// Bit flags for Player state
var	TERRORIST 			= 1 << 0,	// Player is a CT
	COUNTER_TERRORIST	= 1 << 1,	// Player is a T
	BOMB_CARRIER		= 1 << 2,	// Player is the bomb carrier
	DEAD				= 1 << 3;	// Player is dead


var PLAYERS_INDEX = [];	// Global array containing all player instances

//var MAP_OFFSET = { // de_dust2_se
//	x: -2440,
//	y: 3380
//};  4500, 4500

var MAP_OFFSET = { // de_train_se
	x: -2050,
	y: 2300
};


// Main SVG canvas (Raphael "Paper")
var PAPER = Raphael(0, 0, 768, 768).setViewBox(0, 0, 4100, 4100);

// SVG image of the map
var MAP = PAPER.image('/img/de_train_se_radar.svg', 0, 0, 4100, 4100);

var MARKER_WIDTH = 90,
    MARKER_HEIGHT = 92;

// Default marker each player clones from
var T_MARKER = PAPER.image('/img/t_marker.svg', 0, 0, MARKER_WIDTH, MARKER_HEIGHT).hide();
var CT_MARKER = PAPER.image('/img/ct_marker.svg', 0, 0, MARKER_WIDTH, MARKER_HEIGHT).hide();


// Player constructor
function Player (obj) {

	var id = parseInt(obj.id, 10);

	this.id = id; 				// Unique player identifier
	
	this.flags = 0 << 0; 		// Bit field for Player-specific flags
	
	this.name = '';				// In-game name
	
	this.nameEl = PAPER.text(0, 0, 'Player')
                        .attr({
                            'font-size':'60em',
                            'fill': 'black',
                            'stroke': 'white'
                        });

	this.position = { 			// Actual in-game position
		x: obj.pos.x, 	
		y: obj.pos.y,
		a: obj.pos.a 			// Yaw; direction player is looking (in degrees)
	};

	switch ( parseInt(obj.team, 10) ) {
		case 2:
            this.flags |= TERRORIST;
            this.marker = T_MARKER.clone().show();
            break;
		case 3:
            this.flags |= COUNTER_TERRORIST;
            this.marker = CT_MARKER.clone().show();
            break;
		default:
            this.marker = CT_MARKER.clone().show();
	}


	if (!PLAYERS_INDEX[id]) {
		PLAYERS_INDEX[id] = this;
	} else {
		throw Error('Duplicate Player ID: ' + id);
	}

	this.draw();
}


/**
 * Return game coords converted to screen coords
 *
 */
Player.prototype.getScreenCoordinates = function () {

	var y = this.position.y,
		offsetY = MAP_OFFSET.y;

	if (y < 0) {
		y = Math.abs(y) + (offsetY * 2);
	} else {
		y = offsetY + (offsetY - y);
	}

	return {
		x: this.position.x,
		y: y,
		a: (-this.position.a + 90)
	};
};


/**
 * Return player's team
 *
 * 2 = T
 * 3 = CT
 */
Player.prototype.getTeam = function () {
	return 	this.flags & COUNTER_TERRORIST ? 3 :
			this.flags & TERRORIST ? 2 :
			-1;
};


/**
 * Check if player is dead
 *
 */
Player.prototype.isDead = function () {
	return this.flags & DEAD;
};


/**
 * Check if player is the bomb carrier
 *
 */
Player.prototype.hasBomb = function () {
	return this.flags & BOMB_CARRIER;
};


/**
 * Update player object properties
 *
 */
Player.prototype.updatePosition = function (obj) {
	this.position = obj.pos;

	if (obj.dead) {
		this.flags |= DEAD;
	} else {
		this.flags &= ~DEAD;
	}

	this.draw();
};


Player.prototype.draw = function () {
	var coords = this.getScreenCoordinates();

	this.marker.animate({
		opacity: (this.isDead() ? 0.3 : 1),
		x: coords.x - (MARKER_WIDTH/2),
		y: coords.y - (MARKER_HEIGHT/2),
		transform: 't' + Math.abs(MAP_OFFSET.x) + ',' + -MAP_OFFSET.y + 'r' + coords.a
	}, 200, 'ease-in-out');

	this.nameEl.animate({
		x: coords.x,
		y: coords.y + MARKER_HEIGHT,
		transform: 't' + Math.abs(MAP_OFFSET.x) + ',' + -MAP_OFFSET.y
	}, 200, 'ease-in-out');
};


/**
 * Set player's name
 *
 */
Player.prototype.setName = function (name) {
    this.name = name;
    this.nameEl.attr({text:name});
};


/**
 *
 * Helper function to print JSON in a 
 * human-readable format; for debugging 
 * purposes
 *
 */
function pretty_print (val) {
	console.log(JSON.stringify(val, null, '\t'));
}