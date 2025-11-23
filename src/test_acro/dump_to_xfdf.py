import argparse
import json
from pathlib import Path
import xml.etree.ElementTree as ET


def dump_to_xfdf(dump_path: Path) -> str:
    """
    dump_1npr_fields.py 로 만든 JSON(dump)에서
    AcroForm 필드 값들을 XFDF(XML) 문자열로 변환한다.
    """
    data = json.loads(dump_path.read_text(encoding="utf-8"))

    # XFDF 루트
    xfdf = ET.Element(
        "xfdf",
        {
            "xmlns": "http://ns.adobe.com/xfdf/",
            "xml:space": "preserve",
        },
    )

    # <fields> 컨테이너
    fields_el = ET.SubElement(xfdf, "fields")

    for entry in data.get("fields", []):
        pdf_name = entry.get("pdf_name")
        value = entry.get("value")

        # 필드 이름이 없으면 스킵
        if not pdf_name:
            continue

        # value가 None 이면 빈 값으로 처리
        if value is None:
            value = ""

        # <field name="..."><value>...</value></field>
        field_el = ET.SubElement(fields_el, "field", {"name": pdf_name})
        value_el = ET.SubElement(field_el, "value")
        value_el.text = str(value)

    # XML 문자열로 직렬화
    xml_bytes = ET.tostring(xfdf, encoding="utf-8", xml_declaration=True)
    return xml_bytes.decode("utf-8")


def main():
    parser = argparse.ArgumentParser(
        description="Convert 1NPR field dump JSON to XFDF (AcroForm data)."
    )
    parser.add_argument(
        "dump_json",
        help="dump_1npr_fields.py 로 생성한 JSON 파일 (예: 1npr_fields_dump.json)",
    )
    parser.add_argument(
        "-o",
        "--output",
        default="1npr_data.xfdf",
        help="출력 XFDF 파일 이름 (기본값: 1npr_data.xfdf)",
    )
    args = parser.parse_args()

    dump_path = Path(args.dump_json)
    if not dump_path.exists():
        raise FileNotFoundError(dump_path)

    xfdf_str = dump_to_xfdf(dump_path)

    out_path = Path(args.output)
    out_path.write_text(xfdf_str, encoding="utf-8")
    print(f"Saved XFDF to: {out_path}")


if __name__ == "__main__":
    main()
