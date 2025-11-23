#!/usr/bin/env python
# fill_pdf_from_dump.py
#
# 사용법:
#   python fill_pdf_from_dump.py 1npr_2024_writable.pdf 1npr_fields_dump_filled.json -o 1npr_filled_from_dump.pdf
#
# 하는 일:
#   - dump_1npr_fileds.py + fill_dump_from_formdata.py 로 만든
#     "value"/"checked" 가 들어간 dump JSON 을 읽고
#   - 텍스트 필드는 value 채우고
#   - 체크박스/라디오는 checked 플래그 보고 /V, /AS 를 직접 설정해서 체크 표시가 보이게 함.

import argparse
import json
from pathlib import Path
from typing import Any, Dict

from pypdf import PdfReader, PdfWriter
from pypdf.generic import BooleanObject, NameObject


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def build_text_and_btn_targets(fields):
    """
    dump_filled JSON 의 fields 배열에서
    - 텍스트 필드(/Tx): pdf_name -> value
    - 버튼(/Btn): pdf_name -> checked(True/False)
    딕셔너리 두 개를 만든다.
    """
    text_targets: Dict[str, str] = {}
    btn_targets: Dict[str, bool] = {}

    for f in fields:
        ftype = f.get("type")
        pdf_name = f.get("pdf_name")
        if not pdf_name:
            continue
        pdf_name = str(pdf_name)

        if ftype == "/Tx":
            val = f.get("value")
            if val not in (None, ""):
                text_targets[pdf_name] = str(val)

        elif ftype == "/Btn":
            # checked 키가 있으면 True/False 그대로 사용
            if "checked" in f:
                btn_targets[pdf_name] = bool(f["checked"])

    return text_targets, btn_targets


def find_on_state_for_annot(annot_dict):
    """
    이 위젯(또는 parent)의 /AP /N 딕셔너리에서
    /Off 가 아닌 on 상태 토큰을 하나 골라서 NameObject 로 반환.
    (fill_by_label_rules.py 에서 쓰던 것 그대로 가져옴)
    """
    field_dict = annot_dict
    if "/AP" not in field_dict and field_dict.get("/Parent"):
        field_dict = field_dict.get("/Parent").get_object()

    ap = field_dict.get("/AP")
    if not ap:
        return None

    normal = ap.get("/N")
    if not normal:
        return None

    for key in normal.keys():
        if str(key) != "/Off":
            return key  # 이미 NameObject
    return None


def main():
    parser = argparse.ArgumentParser(
        description="Fill PDF AcroForm fields from filled dump JSON (text + checkboxes)."
    )
    parser.add_argument("input_pdf", help="채우기 전 원본 PDF (예: 1npr_2024_writable.pdf)")
    parser.add_argument("filled_dump", help="값/체크가 들어간 dump JSON (예: 1npr_fields_dump_filled.json)")
    parser.add_argument(
        "-o",
        "--output",
        default="1npr_filled_from_dump.pdf",
        help="출력 PDF 이름 (기본: 1npr_filled_from_dump.pdf)",
    )
    args = parser.parse_args()

    pdf_path = Path(args.input_pdf)
    dump_path = Path(args.filled_dump)
    out_path = Path(args.output)

    if not pdf_path.exists():
        raise FileNotFoundError(pdf_path)
    if not dump_path.exists():
        raise FileNotFoundError(dump_path)

    dump_data = load_json(dump_path)
    fields = dump_data.get("fields", [])

    text_targets, btn_targets = build_text_and_btn_targets(fields)

    print("[INFO] Text targets (pdf_name -> value):")
    for k, v in text_targets.items():
        print(f"  {k}: {v}")

    print("[INFO] Button targets (pdf_name -> checked):")
    for k, v in btn_targets.items():
        print(f"  {k}: {v}")

    # 1) PDF 로드 및 복사
    reader = PdfReader(str(pdf_path))
    writer = PdfWriter()
    writer.append(reader)

    # 2) NeedAppearances 설정 (뷰어가 필드 모양 다시 그리도록 힌트)
    root = writer._root_object
    acro_form = None
    if "/AcroForm" in root:
        acro_form = root["/AcroForm"]
    elif "/AcroForm" in reader.trailer["/Root"]:
        acro_form = reader.trailer["/Root"]["/AcroForm"]

    if acro_form is not None:
        acro_form.update({NameObject("/NeedAppearances"): BooleanObject(True)})
        writer._root_object.update({NameObject("/AcroForm"): acro_form})

    # 3) 텍스트 필드(/Tx) 먼저 채우기
    if text_targets:
        for page in writer.pages:
            writer.update_page_form_field_values(
                page,
                text_targets,
                auto_regenerate=False,  # 체크박스는 아래에서 따로 처리
            )

    # 4) 체크박스/라디오(/Btn) 처리
    if btn_targets:
        for page in writer.pages:
            annots = page.get("/Annots")
            if not annots:
                continue

            for annot_ref in annots:
                annot = annot_ref.get_object()
                if annot.get("/Subtype") != "/Widget":
                    continue

                # annotation 자체 또는 parent 의 /T 가 pdf_name
                field_name = annot.get("/T")
                parent = annot.get("/Parent")
                parent_name = parent.get("/T") if parent is not None else None

                fn_str = str(field_name) if field_name is not None else ""
                pn_str = str(parent_name) if parent_name is not None else ""

                # 어떤 이름으로 이 버튼 그룹을 찾을지 결정
                pdf_name = None
                if fn_str in btn_targets:
                    pdf_name = fn_str
                elif pn_str in btn_targets:
                    pdf_name = pn_str

                if not pdf_name:
                    continue

                checked = btn_targets[pdf_name]

                # on_state (예: /Yes, /1, /Single 등)를 찾기
                on_state = find_on_state_for_annot(annot)
                if on_state is None:
                    # push 버튼 등 on_state 없으면 건너뜀
                    continue

                # 필드 딕셔너리 (/V 설정은 parent 기준, 없으면 annot 기준)
                field_dict = parent.get_object() if parent is not None else annot

                if checked:
                    # 체크: /V = on_state, /AS = on_state
                    field_dict.update({NameObject("/V"): on_state})
                    annot.update({NameObject("/AS"): on_state})
                else:
                    # 해제: /V = /Off, /AS = /Off
                    field_dict.update({NameObject("/V"): NameObject("/Off")})
                    annot.update({NameObject("/AS"): NameObject("/Off")})

    # 5) 저장
    with out_path.open("wb") as f:
        writer.write(f)

    print(f"[INFO] Filled PDF saved to: {out_path}")


if __name__ == "__main__":
    main()
