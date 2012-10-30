#include <sourcemod>
#include <sdktools>
#include <cstrike>
#include <socket>

#define PLUGIN_VERSION  "0.0.9"
#define HOSTNAME        "127.0.0.1"
#define UDP_PORT        1338
#define TCP_PORT        1339

public Plugin:myinfo = 
{
    name = "Marauder's Map",
    author = "Kai Mallea, Anton Ásgeirsson",
    description = "Marauder's Map: CS:GO",
    version = PLUGIN_VERSION,
    url = "http://www.marauders-map.com"
}

new Handle:tSocket = INVALID_HANDLE;
new Handle:uSocket = INVALID_HANDLE;
new bool:gReady = false;


// Set up Event handlers for csgo specific events.


public OnPluginStart()
{
    tSocket = SocketCreate(SOCKET_TCP, OnSocketError);
    SocketConnect(tSocket, OnSocketConnect, OnSocketReceive, OnSocketDisconnect, HOSTNAME, TCP_PORT);
    uSocket = SocketCreate(SOCKET_UDP, OnSocketError); 
    SocketConnect(uSocket, OnSocketConnect, OnSocketReceive, OnSocketDisconnect, HOSTNAME, UDP_PORT);
//    HookEvent("hegrenade_detonate", EventHandler); //needs work
    HookEvent("round_end", EventHandler); //works
//    HookEvent("game_newmap", EventHandler); //not working
    HookEvent("player_death", EventHandler);
    HookEvent("player_blind", EventHandler); //works
//    HookEvent("weapon_fire", EventHandler); //needs work
    HookEvent("player_hurt", EventHandler);
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
        
        decl String:info[64]
        Format(info
                , sizeof(info)
                , "%s was killed by %s with a %s (hs: %d)"
                , vname, aname, weapon, headshot
                )
        SocketSend(tSocket, info)
        PrintToServer(
            "%s was killed by %s with a %s (hs: %d)"
            , vname, aname, weapon, headshot
            )
    }
    else if (StrEqual(name, "round_end")) // Prints Round End Status to server, Test
    {
        decl String:message[64]
        new winner = GetEventInt(event, "winner");
        new reason = GetEventInt(event, "reason");
        GetEventString(event, "message", message, sizeof(message))
        
        decl String:info[64]
        Format(info
                , sizeof(info)
                , "Winner: %i Reason %i: Message: %s"
                , winner, reason, message
                )
        SocketSend(tSocket, info)
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
        GetEntPropVector(clientId, Prop_Send, "m_vecOrigin", pos);

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
        
        decl String:info[64]
        Format(info
                , sizeof(info)
                , "%s was blinded by a flashbang"
                , cname
                )
        SocketSend(tSocket, info)
        PrintToServer(
            "%s was blinded by a flashbang"
            , cname
            )
    }
    else if (StrEqual(name, "weapon_fire"))
    {
        decl String:weapon[64], String:cname[64], Float:pos[3]; 
        new clientId = GetEventInt(event, "userid")
        new client = GetClientOfUserId(clientId)
        new bool:silenced = GetEventBool(event, "silenced")
        GetClientName(client, cname, sizeof(cname))
        GetEntPropVector(clientId, Prop_Send, "m_vecOrigin", pos)
        GetEventString(event, "weapon", weapon, sizeof(weapon));
        PrintToServer(
            "%s fired a %s (silenced: %d) from location: x:%fy:%fz:%f"
            , cname, weapon, silenced, pos[0], pos[1], pos[2]
        )

    }
    else if (StrEqual(name, "player_hurt"))
    {
        decl String:weapon[64], String:hitgroup[64];
        new victimId = GetEventInt(event, "userid")
        new attackerId = GetEventInt(event, "attacker")
        new assistId = GetEventInt(event, "assister") 
        new dmg_armor = GetEventInt(event, "dmg_armor")
        new dmg_health = GetEventInt(event, "dmg_health")
        new bool:headshot = GetEventBool(event, "headshot")
        GetEventString(event, "weapon", weapon, sizeof(weapon))
        GetEventString(event, "hitgroup", hitgroup, sizeof(hitgroup))

        decl String:aname[64], String:vname[64], String:assname[64];
        new victim = GetClientOfUserId(victimId)
        new attacker = GetClientOfUserId(attackerId)
        new assister = GetClientOfUserId(assistId)
        GetClientName(attacker, aname, sizeof(aname))
        GetClientName(victim, vname, sizeof(vname))
        GetClientName(assister, assname, sizeof(assname))
        PrintToServer(
            " %s was shot in the %s by %s for %i ammount of dmg, there of %i armor. (hs: %d)"
            , vname, hitgroup, aname, dmg_health, dmg_armor, headshot 
        )
    }
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

        SocketSend(uSocket, playerInfo);
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
