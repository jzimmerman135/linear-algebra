# transpiler
TS			:= tsc
FTML		:= ./.ftml


# build directory
BUILD		:= ./dist
STYLESDIR	:= $(BUILD)/styles
JSDIR		:= $(BUILD)/src

# transpiler flags
TSFLAGS		:= --target es6  --outDir $(JSDIR)

# typescript and javascript files
TSIN		:= $(shell find src -name "*.ts")
JSIN		:= $(shell find src -name "*.js")
JSOUT		:= $(patsubst %,$(BUILD)/%,$(JSIN))

# stylefiles
STYLES		= $(shell find styles -name "*" -mindepth 1) 

# ftml and html files
FTMLIN		:= $(shell find pages -name "*.ftml")
FTMLOUT		:= $(patsubst pages/%.ftml,$(BUILD)/%.html,$(FTMLIN))
HTMLIN		:= $(shell find pages -name "*.html")
HTMLOUT		:= $(patsubst pages/%,$(BUILD)/%,$(HTMLIN))

PROJNAME	:= $(notdir $(PWD))

# everything
all: src styles pages

src: $(JSOUT) ts

ts: $(TSIN)
	tsc $(TSIN) $(TSFLAGS)

launch:
	open $(BUILD)/index.html

pages: $(FTMLOUT) $(HTMLOUT)

# ftml transpile
$(BUILD)/%.html: pages/%.ftml
	@mkdir -p $(@D)	
	@$(FTML) $^ $@ 
	@echo "ftml $^ $@"

# copy edited javascript files
$(BUILD)/src/%.js: src/%.js
	cp $< $@

$(BUILD)/%.html: pages/%.html
	@mkdir -p $(@D)	
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