#include <sdktools>
#include <cstrike>
#include <socket>
/** Custom Includes Below. **/
//#include <m_timers>       
#include <m_events>       
//#include <m_sockets>
//#include <m_marauder>      

#define PLUGIN_VERSION  "0.0.10"
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


/** Convar Handling. **/
//new Handle:g_c4Timer;

public OnPluginStart()
{
    tSocket = SocketCreate(SOCKET_TCP, OnSocketError);
    uSocket = SocketCreate(SOCKET_UDP, OnSocketError);
    SocketConnect(tSocket, OnSocketConnect, OnSocketReceive, OnSocketDisconnect, HOSTNAME, TCP_PORT);
    SocketConnect(uSocket, OnSocketConnect, OnSocketReceive, OnSocketDisconnect, HOSTNAME, UDP_PORT);

    /** Round Events. **/
    HookEvent("round_start", onRoundStart);
    HookEvent("round_freeze_end", onFreezeEnd);
    HookEvent("round_end", onRoundEnd);
//    HookEvent("bomb_beginplant", onBeginPlant);
    HookEvent("bomb_planted", onBombPlanted);
    HookEvent("bomb_defused", onBombDefused);

    /** Grenade Events. **/
    HookEvent("hegrenade_detonate", onHeDetonate);
    HookEvent("flashbang_detonate", onFbDetonate);
    HookEvent("smokegrenade_detonate", onSmokeDetonate);
    HookEvent("molotov_detonate", onMolotovDetonate);
    HookEvent("decoy_detonate", onDecoyDetonate);

    /** Player Events. **/
    HookEvent("weapon_fire", onWeaponFire); 
    HookEvent("player_hurt", onPlayerHurt); 
    HookEvent("player_blind", onPlayerBlind); 
    HookEvent("player_death", onPlayerDeath); 

    
}

public SocketCallBack(Handle:socket, String:info[]) 
{
    SocketSend(socket, info)
    PrintToServer(info)
}

//public Action:OnPlayerRunCmd(client, &buttons, &impulse, Float:vel[3], Float:ang[3], &weapon)
//{
//    if (gReady && IsPlayerAlive(client))
//    {
//        decl team, Float:pos[3];
//
//        team = GetClientTeam(client);
//        GetEntPropVector(client, Prop_Send, "m_vecOrigin", pos);
//
//        decl String:playerInfo[32];
//        Format(playerInfo
//                , sizeof(playerInfo)
//                , "p,%d,%d,%.0f,%.0f,%.0f,%.0f" // p,id,team,x,y,z,yaw
//                , client, team, pos[0], pos[1], pos[2], ang[1]
//        );
//
//        SocketSend(uSocket, playerInfo);
//    }
//}
