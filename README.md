Marauder's Map
==============

CS:GO Data Capture Plugin and Server

## Dependencies:

- Metamod:Source 1.9.0 (http://www.metamodsource.net/downloads/mmsource-1.9.0-linux.tar.gz)
- Sourcemod 1.5.0 snapshot build (http://www.sourcemod.net/smdrop/1.5/sourcemod-1.5.0-hg3657-linux.tar.gz)
- Socket 3.0.1 extension for Sourcemod (http://forums.alliedmods.net/showthread.php?t=67640)

## Compiling and Enabling SourceMod Plugin:

1. Place .sp file in `../csgo/addons/sourcemod/scripting/`
2. Change directory to `../csgo/addons/sourcemod/scripting/`
3. Compile .sp file: `./compile.sh <filename.sp>`
	- Compiled file (.smx) will be output to `../csgo/addons/sourcemod/scripting/compiled/`
4. Move compiled file (.smx) into `../csgo/addons/sourcemod/plugins/`
5. Restart server or change map
6. Ensure plugin is loaded from server console: `sm plugins list`


## Running the Data Capture Server

1. Install dependencies: `make`
2. Start server: `./server.js`