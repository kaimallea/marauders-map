#include <sdktools>
#include <cstrike>
#include <socket>

#define PLUGIN_VERSION  "0.0.9"
#define HOSTNAME        "127.0.0.1"
#define PORT            1338

public Plugin:myinfo = 
{
    name = "Marauder's Map",
    author = "WP",
    description = "Marauder's Map: CS:GO",
    version = PLUGIN_VERSION,
    url = "http://www.marauders-map.com"
}


new Handle:gSocket = INVALID_HANDLE;
new bool:gReady = false;


public OnPluginStart()
{
    gSocket = SocketCreate(SOCKET_UDP, OnSocketError); 
    SocketConnect(gSocket, OnSocketConnect, OnSocketReceive, OnSocketDisconnect, HOSTNAME, PORT);
}


public Action:OnPlayerRunCmd(client, &buttons, &impulse, Float:vel[3], Float:ang[3], &weapon)
{
    if (gReady)
    {
        decl team, bomb, Float:pos[3];

        team = GetClientTeam(client);
        bomb = (GetPlayerWeaponSlot(client, 4) != -1) ? 1: 0; // Is player carrying the bomb?
        GetEntPropVector(client, Prop_Send, "m_vecOrigin", pos); // Get player's position (x,y,z)

        decl String:playerInfo[64];
        Format(playerInfo
                , sizeof(playerInfo)
                , "p,%d,%d,%d,%f,%f,%f,%f" // p,id,team,bomb,x,y,z,yaw
                , client, team, bomb, pos[0], pos[1], pos[2], ang[1]
        );

        SocketSend(gSocket, playerInfo);
    }
}


public OnSocketConnect(Handle:socket, any:arg)
{
    gReady = true;
}


public OnSocketReceive(Handle:socket, String:receiveData[], const dataSize, any:arg) {}


public OnSocketDisconnect(Handle:socket, any:arg) {
    CloseHandle(socket);
    gReady = false;
}


public OnSocketError(Handle:socket, const errorType, const errorNum, any:hFile)
{
    CloseHandle(socket);
    gReady = false;
}
