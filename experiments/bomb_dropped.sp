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

// Called when plugin is fully initialized
// http://docs.sourcemod.net/api/index.php?fastload=show&id=575&
public OnPluginStart()
{
    SocketSetOption(INVALID_HANDLE, SocketKeepAlive, 1);
    SocketSetOption(INVALID_HANDLE, DebugMode, 1);

    // Hook into "bomb_dropped" game events and call Event_BombDropped
    // http://docs.sourcemod.net/api/index.php?fastload=show&id=732&
    HookEvent("bomb_dropped", Event_BombDropped);
}

// Custom function to be called on all "bomb_dropped" game events
public Event_BombDropped(Handle:event, const String:name[] , bool:dontBroadcast)
{
    new String:pname[32],   // Store player's name (32 character maximum)
        player_id,          // Player's user ID
        client;             // Player's "real" ID

    new Handle:socket = SocketCreate(SOCKET_TCP, OnSocketError);

    // Get int value from "userid" key in client hashmap
    player_id = GetEventInt(event, "userid");   // http://docs.sourcemod.net/api/index.php?fastload=show&id=740&
    
    // Translates a userid index to the real player index
    client = GetClientOfUserId(player_id);      // http://docs.sourcemod.net/api/index.php?fastload=show&id=442&
    
    if (client) {
        GetClientName(client, pname, sizeof(pname));    // http://docs.sourcemod.net/api/index.php?fastload=show&id=399&

        // Print a message to all clients
        PrintToChatAll("%s dropped the bomb, yo!", pname);  // http://docs.sourcemod.net/api/index.php?fastload=show&id=115&

        // Make an HTTP request
        SocketConnect(socket, OnSocketConnected, OnSocketReceive, OnSocketDisconnected, "198.74.56.175", 80);
    }
}

// Callback when a socket is connected
public OnSocketConnected(Handle:socket, any:hFile) {
    decl String:requestStr[100];
    Format(requestStr, sizeof(requestStr), "GET / HTTP/1.1\r\nHost: %s\r\nConnection: close\r\n\r\n", "198.74.56.175");
    SocketSend(socket, requestStr);
}

// Callback when a socket receives a chunk of data
public OnSocketReceive(Handle:socket, String:receiveData[], const dataSize, any:hFile) {}

// Callback when a socket is disconnected
public OnSocketDisconnected(Handle:socket, any:hFile) {
    CloseHandle(socket);
}

// Callback when a socket error occurs
public OnSocketError(Handle:socket, const errorType, const errorNum, any:hFile) {
    LogError("socket error %d (errno %d)", errorType, errorNum);
    CloseHandle(socket);
}
