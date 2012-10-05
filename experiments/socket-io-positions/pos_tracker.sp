#include <sourcemod>
#include <socket>

#define PLUGIN_NAME "MMap"
#define HOSTNAME    "127.0.0.1"
#define PORT        1338

// 'myinfo' is required for all plugins and
// must be in this exact format
public Plugin:myinfo = 
{
    name = "Position Tracker Experiment",
    author = "Kai Mallea <kmallea@gmail.com>",
    description = "Test sending location of all clients to TCP server",
    version = "0.0.2",
    url = "http://www.marauders-map.com"
}

new Handle:gSocket = INVALID_HANDLE;   // reusable socket

// Called when plugin is fully initialized
// http://docs.sourcemod.net/api/index.php?fastload=show&id=575&
public OnPluginStart()
{
    SetupSocket();
    CreateTimer(3.0, GetPlayerPositions, _, TIMER_REPEAT); // Call GetPlayerPositions every 3 secs
}


public Action:GetPlayerPositions(Handle:timer)
{
    if (!SocketIsConnected(gSocket)) {
        PrintToChatAll("[%s] GetPlayerPositions: Socket not connected. Attempting to re-establish...", PLUGIN_NAME);
        SetupSocket();
        return Plugin_Continue;
    }

    new clientId = 1,
        maxClients = GetClientCount(),
        team = 0;

    new Float:pos[3];
    
    for (; clientId <= maxClients; clientId++) {

        GetEntPropVector(clientId, Prop_Send, "m_vecOrigin", pos);
        decl String:playerName[32];
        GetClientName(clientId, playerName, sizeof(playerName));
        team = GetClientTeam(clientId);

        decl String:requestStr[175];
        Format(requestStr, sizeof(requestStr), "{\"type\":\"pos\",\"name\":\"%s\",\"client_id\":%d,\"team\":%d,\"pos\":{\"x\":%f,\"y\":%f,\"z\":%f}}\r\n", playerName, clientId, team, pos[0], pos[1], pos[2]);

        SocketSend(gSocket, requestStr);
    }

    return Plugin_Continue;
}


// Set up a resusable socket
public SetupSocket()
{
    // Create a re-usable socket
    gSocket = SocketCreate(SOCKET_TCP, OnSocketError);

    // Set some options on this socket
    SocketSetOption(gSocket, SocketKeepAlive, 1);
    SocketSetOption(gSocket, DebugMode, 1);
   
    // Establish the connection 
    SocketConnect(gSocket, OnSocketConnected, OnSocketReceive, OnSocketDisconnected, HOSTNAME, PORT);
}


// Callback when a socket is connected
public OnSocketConnected(Handle:socket, any:hFile) {
    PrintToChatAll("[%s] OnSocketConnected: Connection established to %s:%d", PLUGIN_NAME, HOSTNAME, PORT);
}


// Callback when a socket receives a chunk of data
public OnSocketReceive(Handle:socket, String:receiveData[], const dataSize, any:hFile) {}


// Callback when a socket is disconnected
public OnSocketDisconnected(Handle:socket, any:hFile) {
    CloseHandle(socket);

    PrintToChatAll("[%s] OnSocketDisconnected: Attempting to re-establish connection...", PLUGIN_NAME);
    
    // Don't ever leave me
    SetupSocket();
}


// Callback when a socket error occurs
public OnSocketError(Handle:socket, const errorType, const errorNum, any:hFile) {
    CloseHandle(socket);
    
    LogError("socket error %d (errno %d)", errorType, errorNum);
    PrintToChatAll("[%s] OnSocketError: %d (errno %d). Attempting to re-establish connection...", PLUGIN_NAME, errorType, errorNum);
    
    SetupSocket();
}
