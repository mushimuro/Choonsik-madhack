PYTHON := python

PDF_IN          := 1npr_2024_writable.pdf
DUMP_JSON       := 1npr_fields_dump.json
FILLED_DUMP     := 1npr_fields_dump_filled.json
FORM_INPUT_JSON := form_input.json
PDF_OUT         := 1npr_filled_from_dump.pdf

.PHONY: all clean

# 네가 말한 순서 그대로:
# 1) dump_1npr_fileds.py
# 2) fill_dump_from_formdata.py
# 3) fill_pdf_from_dump.py
all: $(PDF_OUT)

$(DUMP_JSON): $(PDF_IN) dump_1npr_fileds.py
	$(PYTHON) dump_1npr_fileds.py $(PDF_IN) -o $(DUMP_JSON)

$(FILLED_DUMP): $(DUMP_JSON) $(FORM_INPUT_JSON) fill_dump_from_formdata.py
	$(PYTHON) fill_dump_from_formdata.py $(DUMP_JSON) $(FORM_INPUT_JSON) -o $(FILLED_DUMP)

$(PDF_OUT): $(PDF_IN) $(FILLED_DUMP) fill_pdf_from_dump.py
	$(PYTHON) fill_pdf_from_dump.py $(PDF_IN) $(FILLED_DUMP) -o $(PDF_OUT)

clean:
	- cmd /C del /Q $(DUMP_JSON) $(FILLED_DUMP) $(PDF_OUT) 2>nul
