#include <sourcemod>
#include <socket>

new bool:gReady = false;
new Handle:tSocket = INVALID_HANDLE; /** TCP. **/
new Handle:uSocket = INVALID_HANDLE; /** UDP. **/

/** Socket Functions. **/
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
    PrintToServer("Error: %s",errorType);
    CloseHandle(socket);
    gReady = false;
}
