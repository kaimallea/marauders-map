SHELL := /bin/bash

CSGO_ADDONS_DIR=/opt/csgo/csgo/addons
SCRIPTING_DIR=$(CSGO_ADDONS_DIR)/sourcemod/scripting
COMPILER=$(SCRIPTING_DIR)/compile.sh
INCLUDES_DIR=$(SCRIPTING_DIR)/include
PLUGINS_DIR=$(CSGO_ADDONS_DIR)/sourcemod/plugins
NAME=marauders-map

all: npm plugin

npm:
	npm install

plugin:
	cp $(NAME).sp $(SCRIPTING_DIR)/
	cd $(SCRIPTING_DIR)/; ./compile.sh $(NAME).sp
	ln -s $(SCRIPTING_DIR)/compiled/$(NAME).smx $(PLUGINS_DIR)/

clean:
	rm -rf node_modules/
	if [ -a $(PLUGINS_DIR)/$(NAME).smx ]; then rm $(PLUGINS_DIR)/$(NAME).smx; fi;
	if [ -a $(SCRIPTING_DIR)/$(NAME).sp ]; then rm $(SCRIPTING_DIR)/$(NAME).sp ; fi;
