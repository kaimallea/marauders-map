#include <sourcemod>
#include <sdktools>
#include <cstrike>
#include <socket>

#define PLUGIN_VERSION  "0.1.1"
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
new bool:gReady    = false;
new bool:rStart    = false;             //round start trigger, fires on round_freeze_end
new bool:bStart    = false;             //bomb plant trigger, fires on bomb_planted, overwrites rStart
new gRoundTime     = 0;                 //RoundTimer
new gTick          = 0;                 //Tick Tock

//ConVar Handles
new Handle:g_c4Timer

// Set up Event handlers for csgo specific events.
public OnPluginStart()
{   
    //ConVar Binding
    g_c4Timer = FindConVar("mp_c4timer");
    //TCP & UDP Sockets
    tSocket = SocketCreate(SOCKET_TCP, OnSocketError);
    SocketConnect(tSocket, OnSocketConnect, OnSocketReceive, OnSocketDisconnect, HOSTNAME, TCP_PORT);
    uSocket = SocketCreate(SOCKET_UDP, OnSocketError); 
    SocketConnect(uSocket, OnSocketConnect, OnSocketReceive, OnSocketDisconnect, HOSTNAME, UDP_PORT);
    //HookEvents go to EventHandler
    HookEvent("hegrenade_detonate", EventHandler); //needs work
    //HookEvent("weapon_fire", EventHandler); //needs work
    HookEvent("round_end", EventHandler);                   //rdy 
    HookEvent("player_death", EventHandler);                //rdy
    HookEvent("player_blind", EventHandler);                //rdy
    HookEvent("player_hurt", EventHandler);                 //rdy
    HookEvent("round_start", EventHandler);                 //rdy
    HookEvent("round_freeze_end", EventHandler);            //rdy
    HookEvent("bomb_defused", EventHandler);                //rdy
    HookEvent("bomb_beginplant", EventHandler);
    HookEvent("bomb_planted", EventHandler);                //rdy
    HookEvent("flashbang_detonate", EventHandler);          //rdy
    HookEvent("smokegrenade_detonate", EventHandler);       //rdy
    HookEvent("molotov_detonate", EventHandler);
    HookEvent("decoy_detonate", EventHandler);

}

public OnMapStart() //MUST BE PAIRED WITH OnMapEnd()
{
    decl String:mapname[64];
    GetCurrentMap(mapname, sizeof(mapname));
        decl String:info[64];
    Format(info
        , sizeof(info)
        , "cm,%s"
        , mapname
        )
    SocketSend(tSocket, info)
}
public OnMapEnd()   //MUST BE PAIREDWITH OnMapStart()
{
    bStart         = false;
    rStart         = false;
}

public EventHandler(Handle:event, const String:name[], bool:dontBroadcast)
{
    if (StrEqual(name, "player_death"))            // Prints player_death info to server 
    {
        decl String:weapon[64];
        new victimId      = GetEventInt(event, "userid")
        new attackerId    = GetEventInt(event, "attacker")
        new bool:headshot = GetEventBool(event, "headshot")
        GetEventString(event, "weapon", weapon, sizeof(weapon))

        decl String:aname[64], String:vname[64];
        new victim    = GetClientOfUserId(victimId)
        new attacker  = GetClientOfUserId(attackerId)
        new ateam     = GetClientTeam(attacker)
        new vteam     = GetClientTeam(victim)
        GetClientName(attacker, aname, sizeof(aname))
        GetClientName(victim, vname, sizeof(vname))
        decl String:info[128]
        Format(info
                , sizeof(info)
            , "pd,%i,%i,%s,%s,%i,%i,%s,%d"
            , gRoundTime, bStart, aname, vname, ateam, vteam, weapon, headshot        
            )
        SocketSend(tSocket, info)
    }
    else if (StrEqual(name, "round_start"))        //Round Start Procedures 
    {
    }
    
    else if (StrEqual(name, "round_freeze_end"))   //Procedures after freezetime ends 
    {
        rStart = true;
        CreateTimer(1.0, RoundTime, _, TIMER_REPEAT);
    }
    
    else if (StrEqual(name, "round_end"))          // Prints Round End Status to server, Test
    {
        new winner    = GetEventInt(event, "winner");
        new reason    = GetEventInt(event, "reason");
        decl String:info[64]
        Format(info
                , sizeof(info)
                , "re,%i,%d,%i,%i"
                , gRoundTime, bStart, winner, reason 
                )
        SocketSend(tSocket, info)
        rStart = false;
        bStart = false;
    }
    else if (StrEqual(name, "hegrenade_detonate")) //Not Working as intended
    {
        decl Float:pos[3], String:cname[64];
        new clientId = GetEventInt(event, "userid")
        new client   = GetClientOfUserId(clientId)
        new team     = GetClientTeam(client)
        pos[0]       = GetEventFloat(event, "x")
        pos[1]       = GetEventFloat(event, "y")
        pos[2]       = GetEventFloat(event, "z")
        GetClientName(client, cname, sizeof(cname))

        decl String:info[64]
        Format(info
                , sizeof(info)
                , "hed, %i, %d, %s, %i, %f, %f, %f"
                , gRoundTime, bStart, cname, team, pos[0], pos[1], pos[2] 
                )
        SocketSend(tSocket, info)
    }
    else if (StrEqual(name, "flashbang_detonate")) //Sends location and owner of fb.
    {
        decl Float:pos[3], String:cname[64];
        new clientId = GetEventInt(event, "userid")
        new client   = GetClientOfUserId(clientId)
        new team     = GetClientTeam(client)
        pos[0]       = GetEventFloat(event, "x")
        pos[1]       = GetEventFloat(event, "y")
        pos[2]       = GetEventFloat(event, "z")
        GetClientName(client, cname, sizeof(cname))

        decl String:info[64]
        Format(info
                , sizeof(info)
                , "fbd, %i, %d, %s, %i, %f, %f, %f"
                , gRoundTime, bStart, cname, team, pos[0], pos[1], pos[2] 
                )
        SocketSend(tSocket, info)
    }
    else if (StrEqual(name, "smokegrenade_detonate")) //Sends location and owner of fb.
    {
        decl Float:pos[3], String:cname[64];
        new clientId = GetEventInt(event, "userid")
        new client   = GetClientOfUserId(clientId)
        new team     = GetClientTeam(client)
        pos[0]       = GetEventFloat(event, "x")
        pos[1]       = GetEventFloat(event, "y")
        pos[2]       = GetEventFloat(event, "z")
        GetClientName(client, cname, sizeof(cname))

        decl String:info[64]
        Format(info
                , sizeof(info)
                , "sgd, %i, %d, %s, %i, %f, %f, %f"
                , gRoundTime, bStart, cname, team, pos[0], pos[1], pos[2] 
                )
        SocketSend(tSocket, info)
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
                , "{ \"name\": \"%s\", \"blind\": \"true\" }\n"
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
        //PrintToServer(
        //    " %s was shot in the %s by %s for %i ammount of dmg, there of %i armor. (hs: %d)"
        //    , vname, hitgroup, aname, dmg_health, dmg_armor, headshot 
        //)
    }
    else if (StrEqual(name, "bomb_planted"))
    {
        decl String:cname[64];
        new clientId = GetEventInt(event, "userid")
        new client   = GetClientOfUserId(clientId)
        new bombSite = GetEventInt(event, "site")
        GetClientName(client, cname, sizeof(cname))
        
        decl String:info[64]
        Format(info
                , sizeof(info)
                , "bp,%i,%d,%s"
                ,  gRoundTime, bStart, cname
                )
        SocketSend(tSocket, info)
        rStart = false;
        bStart = true;
        CreateTimer(1.0, BombTime, _, TIMER_REPEAT);
        PrintToServer("-------%i-------",bombSite)
    }
    else if (StrEqual(name, "bomb_defused"))
    {
        decl String:cname[64];
        new clientId = GetEventInt(event, "userid")
        new client   = GetClientOfUserId(clientId)
        new bombSite = GetEventInt(event, "site")
        GetClientName(client, cname, sizeof(cname))
        
        decl String:info[64]
        Format(info
                , sizeof(info)
                , "bd,%i,%d,%s,%i"
                ,  gRoundTime, bStart, cname, bombSite
                )
        SocketSend(tSocket, info)
        PrintToServer("---%i----",bombSite)
    }
}
//UDP SEND
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
//Sockets
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
//RoundTimer
public Action:RoundTime(Handle:timer)
{
    if(rStart == false)
    {
        rStart =false; 
        gTick = 0; 
        return Plugin_Stop;
    }

    new iRoundTime = GameRules_GetProp("m_iRoundTime");
    gTick++;
    static roundTime = 0;
    roundTime = iRoundTime - gTick;
    gRoundTime = roundTime;
    return Plugin_Continue; 
}
//BombTimer
public Action:BombTime(Handle:timer)
{
    if(bStart == false)
    {
        gTick = 0; 
        return Plugin_Stop;
    }
    
    gTick++;
    static bombTime = 0;
    new c4Time      = GetConVarInt(g_c4Timer);
    bombTime        = c4Time - gTick;
    gRoundTime      = bombTime;
    
    PrintToServer("[%i]",gRoundTime)
    return Plugin_Continue; 
}
