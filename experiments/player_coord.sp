#include <sourcemod>
#include <socket>

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

static Handle:global_socket;   // reusable socket
static const String:hostname[] = "198.74.56.175"; // remote host
static const port = 80;   // remote host port


// Called when plugin is fully initialized
// http://docs.sourcemod.net/api/index.php?fastload=show&id=575&
public OnPluginStart()
{
    SetupSocket();

    // Hook into "player_footstep" game events and call Event_BombDropped
    // http://docs.sourcemod.net/api/index.php?fastload=show&id=732&
    HookEvent("player_footstep", Event_PlayerMove);
}


// Set up a resusable socket
static SetupSocket()
{
    // Create a re-usable socket
    global_socket = SocketCreate(SOCKET_TCP, OnSocketError);

    // Set some options on this socket
    SocketSetOption(global_socket, SocketKeepAlive, 1);
    SocketSetOption(global_socket, DebugMode, 1);
   
    // Establish the connection 
    SocketConnect(global_socket, OnSocketConnected, OnSocketReceive, OnSocketDisconnected, hostname, port);
}


static SendData(const String:eventname[], const String:playername[])
{
    decl String:requestStr[200];
    Format(requestStr, sizeof(requestStr), "GET /%s/%s/ HTTP/1.1\r\nHost: %s\r\nConnection: close\r\n\r\n", eventname, playername, hostname);
    SocketSend(global_socket, requestStr);
}

// Custom function to be called on all "bomb_dropped" game events
public Event_PlayerMove(Handle:event, const String:name[] , bool:dontBroadcast)
{
    new Float:ppos[3],		// Store player's position
	new String:pname[32],   // Store player's name (32 character maximum)
        player_id,          // Player's user ID
        client;             // Player's "real" ID

    // Get int value from "userid" key in client hashmap
    player_id = GetEventInt(event, "userid");   // http://docs.sourcemod.net/api/index.php?fastload=show&id=740&
    


	// Translates a userid index to the real player index
    client = GetClientOfUserId(player_id);      // http://docs.sourcemod.net/api/index.php?fastload=show&id=442&

    // Get coordinates from "client"
	player_coords = GetEntDataVector(client, origin, ppos);
  
    if (client) {
        GetClientName(client, pname, sizeof(pname));    // http://docs.sourcemod.net/api/index.php?fastload=show&id=399&

        // Print a message to all clients
        PrintToChatAll("%s moved to %n", pname, ppos);  // http://docs.sourcemod.net/api/index.php?fastload=show&id=115&

        if (SocketIsConnected(global_socket)) {
            SendData(name, pname);
        }    
    }
}

// Callback when a socket is connected
public OnSocketConnected(Handle:socket, any:hFile) {}

// Callback when a socket receives a chunk of data
public OnSocketReceive(Handle:socket, String:receiveData[], const dataSize, any:hFile) {}

// Callback when a socket is disconnected
public OnSocketDisconnected(Handle:socket, any:hFile) {
    CloseHandle(socket);

    // Don't ever leave me
    SetupSocket();
}

// Callback when a socket error occurs
public OnSocketError(Handle:socket, const errorType, const errorNum, any:hFile) {
    LogError("socket error %d (errno %d)", errorType, errorNum);
    CloseHandle(socket);
}
