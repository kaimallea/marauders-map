/**
 * Timers for Marauder's Map
 * TODO: TEST
 */
#include <sourcemod>
#include <sdktools>
/** Global Variables. **/
new bool:rStart    = false;         /** Round Start. **/
new bool:bStart    = false;         /** Bomb Timer Start. **/ 
new gRoundTime     = 0;
new gTick          = 0;

/** Convar Handling. **/
new Handle:g_c4Timer;

/** Round Timer. **/
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
/** Bomb Timer. **/
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
    return Plugin_Continue; 
}
