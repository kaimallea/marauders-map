#include <sourcemod>
#include <sdktools>
#include <cstrike>
#include <socket>

#define PLUGIN_VERSION  "0.0.9"
#define HOSTNAME        "127.0.0.1"
#define PORT            1338

public Plugin:myinfo = 
{
    name = "Marauder's Map",
    author = "Kai Mallea, Anton Ásgeirsson",
    description = "Marauder's Map: CS:GO",
    version = PLUGIN_VERSION,
    url = "http://www.marauders-map.com"
}


new Handle:gSocket = INVALID_HANDLE;
new bool:gReady = false;


// Set up Event handlers for csgo specific events.


public OnPluginStart()
{
    gSocket = SocketCreate(SOCKET_UDP, OnSocketError); 
    SocketConnect(gSocket, OnSocketConnect, OnSocketReceive, OnSocketDisconnect, HOSTNAME, PORT);
    HookEvent("hegrenade_detonate", EventHandler);
    HookEvent("round_end", EventHandler);
    HookEvent("game_newmap", EventHandler);
    HookEvent("player_death", EventHandler);
    HookEvent("player_blind", EventHandler);
}

public EventHandler(Handle:event, const String:name[], bool:dontBroadcast)
{
    if (StrEqual(name, "player_death")) // Prints player_death info to server, Test
    {
        decl String:weapon[64]
        new victimId = GetEventInt(event, "userid")
        new attackerId = GetEventInt(event, "attacker")
        new bool:headshot = GetEventBool(event, "headshot")
        GetEventString(event, "weapon", weapon, sizeof(weapon))

        decl String:aname[64], String:vname[64];
        new victim = GetClientOfUserId(victimId)
        new attacker = GetClientOfUserId(attackerId)
        GetClientName(attacker, aname, sizeof(aname))
        GetClientName(victim, vname, sizeof(vname))
        PrintToServer(
            "%s was killed by %s with a %s (headshot: %d)"
            , vname, aname, weapon, headshot
            )
    }
   
    else if (StrEqual(name, "round_end")) // Prints Round End Status to server, Test
    {
        decl String:message[64]
        new winner = GetEventInt(event, "winner");
        new reason = GetEventInt(event, "reason");
        GetEventString(event, "message", message, sizeof(message))
        PrintToServer(
            "winner: %i, reason: %i, message: %s"
            , winner, reason, message
            )
        
    }

    else if (StrEqual(name, "hegrenade_detonate")) //Not Working as intended
    {
        decl Float:pos[3], String:cname[64];
        new clientId = GetEventInt(event, "userid")
        new client = GetClientOfUserId(clientId)
        GetClientName(client, cname, sizeof(cname))
        GetEntPropVector(event, Prop_Send, "m_vecOrigin", pos);

        PrintToServer(
            "%s's HE Grenade exploded @ X:%f, Y:%f, Z:%f"
            , cname, pos[0], pos[1], pos[2]
        )
    }

    else if (StrEqual(name, "game_newmap")) //Not Working at all
    {
        decl String:mapname[64]
        GetEventString(event, "mapname", mapname, sizeof(mapname));
        PrintToServer(
            "The current map is: %s"
            , mapname
        )
    }
    
    else if (StrEqual(name, "player_blind"))
    {
        decl String:cname[64];
        new clientId = GetEventInt(event, "userid")
        new client = GetClientOfUserId(clientId)
        GetClientName(client, cname, sizeof(cname))
        PrintToServer(
            "%s was blinded by a flashbang"
            , cname
            )
    }
}


public MapName(Handle:event, const String:name[], bool:dontBroadcast)
{
    decl String:mapname[64]
    GetEventString(event, "mapname", mapname, sizeof(mapname));
    PrintToServer("The Current Map is: %s",mapname);

//    if (gReady)
//    {
//        decl String:mapname[64];
//        GetEventString(event, "mapname", mapname, sizeof(mapname))
//        
//        decl String:mapInfo[64];
//        Format(mapInfo
//            , sizeof(mapInfo)
//            , "m,%s" // m, mapname
//            , mapname
//        );
//
//        SocketSend(gSocket, mapInfo);
//}
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
