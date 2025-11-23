# Makefile - 1NPR PDF 파이프라인 (현재 디렉토리 기준 실존 스크립트만 사용)
#
# 사용법:
#   make            # = dump + api_fill (form_input.json 기반으로 PDF 채우기)
#   make dump       # PDF -> 필드 덤프 JSON
#   make api_fill   # form_input.json 기반으로 PDF 채우기
#   make rules_fill # rules_config.py + fill_by_label_rules.py 으로 채우기
#   make label_test # fill_1npr_by_labels.py 테스트 채우기
#   make overrides  # overrides.json 적용 + XFDF 생성
#   make xfdf       # filled dump -> XFDF 변환만
#   make clean      # 생성 파일 삭제

PYTHON := python

PDF              := 1npr_2024_writable.pdf

DUMP_JSON        := 1npr_fields_dump.json
FILLED_DUMP      := 1npr_fields_dump_filled.json
XFDF             := 1npr_data.xfdf

FORM_INPUT_JSON  := form_input.json
OVERRIDES_JSON   := overrides.json

API_FILLED_PDF   := 1npr_filled_from_api.pdf
RULES_FILLED_PDF := 1npr_filled_by_rules.pdf
LABEL_TEST_PDF   := 1npr_filled_label_test.pdf

.PHONY: all dump api_fill rules_fill label_test overrides xfdf clean

# 기본: dump 하고 API 데이터로 채우기
all: dump api_fill

# 1) PDF -> 필드 덤프 JSON
dump: $(DUMP_JSON)

$(DUMP_JSON): $(PDF) dump_1npr_fileds.py
	$(PYTHON) dump_1npr_fileds.py $(PDF) -o $(DUMP_JSON)

# 2-A) form_input.json 기반으로 PDF 채우기
api_fill: $(API_FILLED_PDF)

$(API_FILLED_PDF): $(PDF) $(DUMP_JSON) $(FORM_INPUT_JSON) fill_from_formdata.py
	$(PYTHON) fill_from_formdata.py $(PDF) $(DUMP_JSON) $(FORM_INPUT_JSON) -o $(API_FILLED_PDF)

# 2-B) rules_config.py 라벨 규칙 기반으로 채우기
rules_fill: $(RULES_FILLED_PDF)

$(RULES_FILLED_PDF): $(PDF) $(DUMP_JSON) rules_config.py fill_by_label_rules.py
	$(PYTHON) fill_by_label_rules.py $(PDF) $(DUMP_JSON) -o $(RULES_FILLED_PDF)

# 2-C) 라벨 하드코딩 테스트 (모든 값 1 넣는 그 스크립트)
label_test: $(LABEL_TEST_PDF)

$(LABEL_TEST_PDF): $(PDF) $(DUMP_JSON) fill_1npr_by_labels.py
	$(PYTHON) fill_1npr_by_labels.py $(PDF) $(DUMP_JSON) -o $(LABEL_TEST_PDF)

# 3-A) overrides.json 적용 + XFDF까지 만들기
overrides: $(XFDF)

$(FILLED_DUMP): $(DUMP_JSON) $(OVERRIDES_JSON) apply_field_updates.py
	$(PYTHON) apply_field_updates.py $(DUMP_JSON) $(OVERRIDES_JSON) -o $(FILLED_DUMP)

$(XFDF): $(FILLED_DUMP) dump_to_xfdf.py
	$(PYTHON) dump_to_xfdf.py $(FILLED_DUMP) -o $(XFDF)

# 3-B) XFDF만 필요할 때는
xfdf: $(XFDF)

# 생성물 정리 (Windows cmd 기준)
clean:
	- cmd /C del /Q $(DUMP_JSON) $(FILLED_DUMP) $(XFDF) $(API_FILLED_PDF) $(RULES_FILLED_PDF) $(LABEL_TEST_PDF) 2>nul
