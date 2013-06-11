/**
 * Custom Non-SourceMod Specific functions
 */

public SendPlayerNames()
{
    if (!gReady) return;

    for (new i = 1; i < MaxClients; i++) {
        if (!IsClientInGame(i)) {
          continue;
        }

        decl String:name[32];
        GetClientName(i, name, sizeof(name));

        decl String:payload[38];
        Format(payload
              , sizeof(payload)
              , "n,%d,%s"
              , i
              , name
        );

        SocketSend(uSocket, payload);
    }
}

