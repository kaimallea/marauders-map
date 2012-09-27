#include <sourcemod>

// 'myinfo' is required for all plugins and
// must be in this exact format
public Plugin:myinfo = 
{
	name = "Bomb Drop Hook Experiment",
	author = "Kai",
	description = "Test hooking into bomb drop event",
	version = "0.0.1",
	url = ""
}

// Called when plugin is fully initialized
// http://docs.sourcemod.net/api/index.php?fastload=show&id=575&
public OnPluginStart()
{
	// Hook into "bomb_dropped" game events and call Event_BombDropped
	// http://docs.sourcemod.net/api/index.php?fastload=show&id=732&
	HookEvent("bomb_dropped", Event_BombDropped);
}

// Custom function to be called on all "bomb_dropped" game events
public Event_BombDropped(Handle:event, const String:name[] , bool:dontBroadcast)
{
	new String:name[32],	// Store player's name (32 character maximum)
		player_id,			// Player's user ID
		client;				// Player's "real" ID

	// Get int value from "userid" key in client hashmap
	player_id = GetEventInt(event, "userid");	// http://docs.sourcemod.net/api/index.php?fastload=show&id=740&
	
	// Translates a userid index to the real player index
	client = GetClientOfUserId(player_id);		// http://docs.sourcemod.net/api/index.php?fastload=show&id=442&
	
	if (client)
	{
		GetClientName(client, name, sizeof(name));	// http://docs.sourcemod.net/api/index.php?fastload=show&id=399&

		// Print a message to all clients
		PrintToChatAll("%s dropped the bomb, yo!", name);	// http://docs.sourcemod.net/api/index.php?fastload=show&id=115&
	}
}