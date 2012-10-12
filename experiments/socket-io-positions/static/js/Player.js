// Bit flags for Player state
var	TERRORIST 			= 1 << 0,	// Player is a CT
	COUNTER_TERRORIST	= 1 << 1,	// Player is a T
	BOMB_CARRIER		= 1 << 2,	// Player is the bomb carrier
	DEAD				= 1 << 3;	// Player is dead


var PLAYERS_INDEX = [];	// Global array containing all player instances


// Main SVG canvas (Raphael "Paper")
var PAPER = Raphael(0, 0, 512, 512);


// SVG image of the map
var MAP = PAPER.image('de_dust2_se_radar.svg', 0, 0, 512, 512);


// Player constructor
function Player (obj) {

	var id = parseInt(obj.id, 10);

	this.id = id; 				// Unique player identifier
	
	this.flags = 0 << 0; 		// Bit field for Player-specific flags
	
	this.name = '';				// In-game name
	
	this.position = { 			// Actual in-game position
		x: obj.pos.x, 	
		y: obj.pos.y,
		a: obj.pos.a 			// Yaw; direction player is looking (in degrees)
	};

	switch ( parseInt(obj.team, 10) ) {
		case 2:
			this.flags |= TERRORIST;
			break;
		case 3:
			this.flags |= COUNTER_TERRORIST;
			break;
	}


	if (!PLAYERS_INDEX[id]) {
		PLAYERS_INDEX[id] = this;
	} else {
		throw Error('Duplicate Player ID: ' + id);
	}
}


/**
 * Return game coords converted to screen coords
 *
 */
Player.prototype.getScreenCoordinates = function (screenWidth, screenHeight) {

	return {
		x: (this.position.x + 4096) / (8192 / screenWidth),
		y: (-this.position.y + 4096) / (8192 / screenHeight),
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
	return 	this.flags & COUNTER_TERRORIST ? 2 :
			this.flags & TERRORIST ? 3 :
			-1;
};


/**
 * Check if player is dead
 *
 */
Player.prototype.isDead = function () {
	return this.flags & IS_DEAD;
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
	this.pos = obj.pos;

	if (obj.dead) {
		this.flags |= IS_DEAD;
	} else {
		this.flags &= ~IS_DEAD;
	}
};


/**
 * Set player's name
 *
 */
Player.prototype.setName = function (name) {
	this.name = name;
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