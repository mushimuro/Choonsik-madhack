# dump_1npr_fields.py
"""
1NPR 2024 writable PDF 안에 있는 모든 AcroForm 필드(입력칸)를
이름/타입/값/좌표/페이지 정보와 함께 JSON으로 덤프한다.

사용 예:
    python dump_1npr_fields.py 1npr_2024_writable.pdf -o 1npr_fields_dump.json
"""

import argparse
import json
from pathlib import Path
from typing import Any, Dict, List, Optional

from pypdf import PdfReader
from pypdf.generic import DictionaryObject


def get_page_index_for_field(reader: PdfReader, field_dict: DictionaryObject) -> Optional[int]:
    page_obj = field_dict.get("/P")
    if page_obj is None:
        return None

    # 직접 객체 비교
    for idx, page in enumerate(reader.pages):
        if page_obj is page:
            return idx

    # indirect_reference 비교 (일부 PDF에서 필요할 수 있음)
    ref = getattr(page_obj, "indirect_reference", None)
    if ref is not None:
        for idx, page in enumerate(reader.pages):
            if getattr(page, "indirect_reference", None) == ref:
                return idx

    return None


def normalize_field(name: str, field_dict: DictionaryObject, reader: PdfReader) -> Dict[str, Any]:
    value = field_dict.get("/V")
    if value is not None:
        value = str(value)

    field_type = field_dict.get("/FT")
    if field_type is not None:
        field_type = str(field_type)

    alt_name = field_dict.get("/TU") or field_dict.get("/T")
    if alt_name is not None:
        alt_name = str(alt_name)

    rect = field_dict.get("/Rect")
    if rect is not None:
        try:
            rect = [float(x) for x in rect]
        except Exception:
            rect = list(rect)

    page_index = get_page_index_for_field(reader, field_dict)

    return {
        "pdf_name": name,
        "alt_name": alt_name,
        "type": field_type,
        "value": value,
        "page_index": page_index,
        "rect": rect,
    }


def extract_all_fields(pdf_path: Path) -> Dict[str, Any]:
    reader = PdfReader(str(pdf_path))
    raw_fields = reader.get_fields() or {}

    fields: List[Dict[str, Any]] = []
    for name, fd in raw_fields.items():
        try:
            fields.append(normalize_field(name, fd, reader))
        except Exception as e:
            fields.append({
                "pdf_name": name,
                "error": str(e),
            })

    return {
        "source_pdf": str(pdf_path),
        "num_fields": len(fields),
        "fields": fields,
    }


def main():
    parser = argparse.ArgumentParser(
        description="Dump all AcroForm fields from 1NPR PDF to JSON."
    )
    parser.add_argument("pdf_path", help="1NPR writable PDF (예: 1npr_2024_writable.pdf)")
    parser.add_argument(
        "-o", "--output", default="1npr_fields_dump.json",
        help="출력 JSON 파일 이름 (기본값: 1npr_fields_dump.json)",
    )
    args = parser.parse_args()

    pdf_path = Path(args.pdf_path)
    if not pdf_path.exists():
        raise FileNotFoundError(pdf_path)

    result = extract_all_fields(pdf_path)

    out_path = Path(args.output)
    out_path.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Saved field dump to: {out_path}")


if __name__ == "__main__":
    main()
