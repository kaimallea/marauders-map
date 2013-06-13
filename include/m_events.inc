/** Event Handling gunctions **
 *
 *  TODO: NEEDS TESTING.
 *  TODO: Remove PrintToServers once testing is done.
 */

#include <sourcemod>
#include <sdktools>
#include <cstrike>
#include <socket>
#include <m_sockets>
#include <m_timers>
#include <m_marauder>
/** Round Related Events. **/
public onRoundStart(Handle:event, const String:name[], bool:dontBroadcast) /**Round Start.**/
{
    /**
     * Note: Starts with freezetime so onFreezeEnd
     * is used instead for starting the round timer.
     */
    SendPlayerNames(); /** This Function Resides in marauder.inc **/
}

public onFreezeEnd(Handle:event, const String:name[], bool:dontBroadcast) /**Freezetime End.**/
{
    rStart = true;      /** Global Variable; used to stop the timer on round end.**/
    CreateTimer(1.0, RoundTime, _, TIMER_REPEAT);
}

public onRoundEnd(Handle:event, const String:name[], bool:dontBroadcast) /**Round End.**/
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

public onBombPlanted(Handle:event, const String:name[], bool:dontBroadcast) /**Bomb Planted.**/
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
public onBombDefused(Handle:event, const String:name[], bool:dontBroadcast) /**Bomb Defused.**/
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
/**Grenade Related Events.**/
public onHeDetonate(Handle:event, const String:name[], bool:dontBroadcast)
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

public onFbDetonate(Handle:event, const String:name[], bool:dontBroadcast)
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

public onSmokeDetonate(Handle:event, const String:name[], bool:dontBroadcast)
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

public onMolotovDetonate(Handle:event, const String:name[], bool:dontBroadcast)
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

public onDecoyDetonate(Handle:event, const String:name[], bool:dontBroadcast)
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

/** Player Related Events. **/
public onPlayerDeath(Handle:event, const String:name[], bool:dontBroadcast) /**Player Death.**/
{
    decl String:weapon[64];
    new victimId      = GetEventInt(event, "userid")
    new attackerId    = GetEventInt(event, "attacker")
    new penetrated    = GetEventInt(event, "penetrated")
    new bool:headshot = GetEventBool(event, "headshot")
    GetEventString(event, "weapon", weapon, sizeof(weapon))

    decl String:aname[64], String:vname[64];                /*Attacker Name & Victim Name*/
    new victim        = GetClientOfUserId(victimId)
    new attacker      = GetClientOfUserId(attackerId)
    new ateam         = GetClientTeam(attacker)
    new vteam         = GetClientTeam(victim)
    GetClientName(attacker, aname, sizeof(aname))
    GetClientName(victim, vname, sizeof(vname))
    decl String:info[128]
    Format(info
            , sizeof(info)
        , "pd,%i,%i,%s,%s,%i,%i,%s,%d,%i"
        , gRoundTime, bStart, aname, vname, ateam, vteam, weapon, headshot, penetrated        
        )
    SocketSend(tSocket, info)
    PrintToServer(info)
}

public onPlayerBlind(Handle:event, const String:name[], bool:dontBroadcast) /**Player Blind.**/
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

public onPlayerHurt(Handle:event, const String:name[], bool:dontBroadcast) /**Player Hurt.**/
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
    decl String:info[64];
    Format(info
        , sizeof(info)
        , "ph,%i,%s,%s,%s"
        , gRoundTime, bStart, aname, vname 
    //    " %s was shot in the %s by %s for %i ammount of dmg, there of %i armor. (hs: %d)"
        )
}

public onWeaponFire(Handle:event, const String:name[], bool:dontBroadcast) /**Weapon Fire.**/
{
    decl String:weapon[64], String:cname[64], Float:pos[3]; 
    new clientId = GetEventInt(event, "userid")
    new client = GetClientOfUserId(clientId)
    new bool:silenced = GetEventBool(event, "silenced")
    GetClientName(client, cname, sizeof(cname))
    GetEventString(event, "weapon", weapon, sizeof(weapon));
    
    decl String:info[64]
    Format(info
          , sizeof(info)
          , "wf,%i,%d,%s,%s,%d,"
          , gRoundTime, bStart, cname, weapon, silenced 
          )
    SocketSend(uSocket, info) //UDP 
}

public onPlayerSpawned(Handle:event, const String:name[], bool:dontBroadcast)
{
    if (gReady)
    {
        new clientid = GetClientOfUserId(GetEventInt(event, "userid"));
        decl String:payload[32];
        Format(payload
              , sizeof(payload)
              , "s,%d"
              , clientid
        );

        SocketSend(uSocket, payload);
    }
}


