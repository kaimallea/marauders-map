#include <sdktools>
#include <cstrike>
#include <socket>

#define PLUGIN_NAME "MMap"
#define HOSTNAME    "127.0.0.1"
#define PORT        1338
#define UPDATE_RATE 0.20   // Seconds

public Plugin:myinfo = 
{
    name = "Position Tracker Experiment",
    author = "Kai Mallea <kmallea@gmail.com>",
    description = "Test sending location of all clients to TCP server",
    version = "0.0.8",
    url = "http://www.marauders-map.com"
}

new Handle:gSocket; // reusable socket

// Called when plugin is fully initialized
// http://docs.sourcemod.net/api/index.php?fastload=show&id=575&
public OnPluginStart()
{
    SetupSocket();

    CreateTimer(UPDATE_RATE, GetPlayerPositions, _, TIMER_REPEAT);
}


public Action:GetPlayerPositions(Handle:timer)
{
    //PrintToChatAll("GetPlayerPositions()");

    if (!SocketIsConnected(gSocket)) {
        SetupSocket();
        //PrintToChatAll("GetPlayerPositions(): Socket wasn't connected");
        return Plugin_Continue;
    }

    new clientId = 1,
        team = 0,
        bomb = 0,
        dead = 0,
        total = 0,
        Float:pos[3],
        Float:ang[3];


    //PrintToChatAll("GetPlayerPositions(): Attempting to allocate %d bytes", (32+1)*128);


    // Payload will be a JSON object, with an array of objects
    new String:payload[(32+1)*128];

    // Open JSON object
    StrCat(payload, sizeof(payload), "{\"pos\":[");


    //PrintToChatAll("GetPlayerPositions(): Start loop");
    
    // Loop through all players and collect their info
    for (; clientId <= MaxClients; clientId++) {

        
        //PrintToChatAll("GetPlayerPositions(): Loop #%d", clientId);
        
        if (!IsClientInGame(clientId)) {
            continue;
        }

        if (++total > 1) {
            StrCat(payload, sizeof(payload), ",");
        }

        // Get player's position (x,y,z)
        GetEntPropVector(clientId, Prop_Send, "m_vecOrigin", pos);

        // Is player carrying the bomb?
        bomb = (GetPlayerWeaponSlot(clientId, 4) != -1) ? 1: 0;

        // Get player's team
        team = GetClientTeam(clientId);

        // Is player alive?
        dead = IsPlayerAlive(clientId) ? 0 : 1;
    
        // Get player angles
        GetClientEyeAngles(clientId, ang);

        decl String:playerInfo[128];
        // Create a JSON object containing player info
        Format(playerInfo
                , sizeof(playerInfo)
                , "{\"cd\":%d,\"dead\":%d,\"bomb\":%d,\"team\":%d,\"y\":%f,\"pos\":{\"x\":%f,\"y\":%f}}"
                , clientId
                , dead
                , bomb
                , team
                , ang[1]
                , pos[0], pos[1]
        );

        StrCat(payload, sizeof(payload), playerInfo);


    }

    //PrintToChatAll("GetPlayerPositions(): %d players processed", total);
    
    // Nothing to send
    if (!total) {
        return Plugin_Continue;
    }
 
    // Close JSON object, add CRLF delimeter
    StrCat(payload, sizeof(payload), "]}\r\n");

    //PrintToChatAll("Sending info for %d players", total);

    // Send data to HOSTNAME:PORT via TCP
    SocketSend(gSocket, payload);    

    return Plugin_Continue;
}


// Set up a resusable socket
public SetupSocket() {
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
    CloseHandle(socket);
    
    SetupSocket();
}
