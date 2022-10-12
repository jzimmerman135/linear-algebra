# transpiler
TS			:= tsc
FTML		:= ./.ftml

# transpiler flags
TSFLAGS		:=

# build directory
BUILD		:= ./build
STYLESDIR	:= $(BUILD)/styles
JSDIR		:= $(BUILD)/src

# typescript and javascript files
TSIN		:= $(shell find src -name "*.ts")
JSIN		:= $(shell find src -name "*.js")
JSOUT		:= $(patsubst %,$(BUILD)/%,$(JSIN))

# stylefiles
STYLES		= $(shell find styles -name "*" -mindepth 1) 

# ftml and html files
PAGESIN		:= $(shell find pages -name "*.ftml")
PAGESOUT	:= $(patsubst pages/%.ftml,$(BUILD)/%.html,$(PAGESIN))

PROJNAME	:= $(notdir $(PWD))

# everything
all: src styles pages

src: $(JSOUT) ts

ts: $(TSIN)
	tsc $(TSIN) --outDir $(JSDIR)

launch:
	open $(BUILD)/index.html

pages: $(PAGESOUT)

# ftml transpile
$(BUILD)/%.html: pages/%.ftml
	@mkdir -p $(@D)	
	@$(FTML) $^ $@ 
	@echo "ftml $^ $@"

# copy edited javascript files
$(BUILD)/src/%.js: src/%.js
	cp $< $@

.PHONY: all ts pages styles clean

learn:
	@echo $(LDLIBS)

build:
	@mkdir -p $(APP_DIR)
	@mkdir -p $(OBJ_DIR)
	@mkdir -p $(TEST_DIR)
	@mkdir -p $(LIB_DIR)

clean:
	-@rm -rvf $(BUILD)/src $(BUILD)/*.html