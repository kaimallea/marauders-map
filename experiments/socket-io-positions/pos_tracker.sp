#include <sourcemod>
#include <socket>

#define HOSTNAME    "127.0.0.1"
#define PORT        1338

// 'myinfo' is required for all plugins and
// must be in this exact format
public Plugin:myinfo = 
{
    name = "Position Tracker Experiment",
    author = "Kai",
    description = "Test sending location of all clients to TCP server",
    version = "0.0.1",
    url = ""
}

static Handle:gSocket;   // reusable socket

// Called when plugin is fully initialized
// http://docs.sourcemod.net/api/index.php?fastload=show&id=575&
public OnPluginStart()
{
    SetupSocket();
    CreateTimer(3.0, GetPlayerPositions, _, TIMER_REPEAT); // Call GPP every 3 secs
}


public Action:GetPlayerPositions(Handle:timer)
{
    new i = 1, max = GetClientCount();
    new team = 0;
    new Float:pos[3];
    
    for (; i <= max; i++) {
        GetEntPropVector(i, Prop_Send, "m_vecOrigin", pos);
        team = GetClientTeam(i);
        decl String:requestStr[100];
        Format(requestStr, sizeof(requestStr), "{\"type\":\"pos\",\"id\":%d,\"team\":%d,\"pos\":{\"x\":%f,\"y\":%f,\"z\":%f}}\r\n", i, team, pos[0], pos[1], pos[2]);

        SocketSend(gSocket, requestStr);
    }

    return Plugin_Continue;
}


// Set up a resusable socket
static SetupSocket()
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
