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
JSOUT		:= $(patsubst %.ts,$(BUILD)/%.js,$(TSIN))

# stylefiles
STYLES		= $(shell find styles -name "*" -mindepth 1) 

# ftml and html files
PAGESIN		:= $(shell find pages -name "*.ftml")
PAGESOUT	:= $(patsubst pages/%.ftml,$(BUILD)/%.html,$(PAGESIN))

PROJNAME	:= $(notdir $(PWD))

# everything
all: ts styles pages

ts: $(TSIN)
	tsc $(TSIN) --outDir $(JSDIR)

pages: $(PAGESOUT)

styles: $(STYLES)
	@rm -rvf $(STYLESDIR)/*
	@mkdir -p $(STYLESDIR)
	@cp -r styles/ $(STYLESDIR)/

# ftml transpile
$(BUILD)/%.html: pages/%.ftml
	@mkdir -p $(@D)	
	@$(FTML) $^ $@ 
	@echo "ftml $^ $@"

.PHONY: all ts pages styles clean

learn:
	@echo $(LDLIBS)

build:
	@mkdir -p $(APP_DIR)
	@mkdir -p $(OBJ_DIR)
	@mkdir -p $(TEST_DIR)
	@mkdir -p $(LIB_DIR)

clean:
	-@rm -rvf $(BUILD)/src $(BUILD)/*.html $(BUILD)/styles
