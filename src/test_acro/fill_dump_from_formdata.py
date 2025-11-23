#!/usr/bin/env python
# fill_dump_from_formdata.py
#
# 사용법:
#   python fill_dump_from_formdata.py 1npr_fields_dump.json form_input.json -o 1npr_fields_dump_filled.json
#
# 하는 일:
#   - dump_1npr_fileds.py 로 만든 필드 덤프 JSON을 읽고
#   - form_input.json (formData) 를 읽어서
#   - alt_name / pdf_name 기반으로 각 필드 entry에 "value" 또는 "checked" 를 채워 넣는다.
#   - 결과를 filled dump JSON 으로 출력.

import argparse
import json
from pathlib import Path
from typing import Any, Dict, Tuple


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def normalize(s: str) -> str:
    return "".join(str(s).strip().lower().split())


def parse_ssn(ssn: str) -> Tuple[str, str, str]:
    parts = ssn.split("-")
    if len(parts) != 3:
        return ssn, "", ""
    return parts[0], parts[1], parts[2]


def parse_dob_yyyy_mm_dd(dob: str) -> Tuple[str, str, str]:
    try:
        y, m, d = dob.split("-")
        if len(m) == 1:
            m = "0" + m
        if len(d) == 1:
            d = "0" + d
        return m, d, y
    except Exception:
        return "", "", ""


def fill_text_fields(fields, form_data: Dict[str, Any]) -> None:
    """
    type == /Tx 인 필드들에 form_data 기반 value 채우기.
    alt_name 을 보고 매핑.
    """
    for f in fields:
        if f.get("type") != "/Tx":
            continue

        pdf_name = f.get("pdf_name") or ""
        alt_raw = (f.get("alt_name") or "")
        alt = alt_raw.lower()

        # 이름
        if "your legal first name" in alt and "firstName" in form_data:
            f["value"] = form_data["firstName"]
        elif "your legal last name" in alt and "last name" in alt and "lastName" in form_data:
            f["value"] = form_data["lastName"]
        elif "your middle initial" in alt and "middleInitial" in form_data:
            f["value"] = form_data["middleInitial"]

        # 주소
        elif "home address (number and street)" in alt and "address" in form_data:
            addr = form_data.get("address", "")
            apt = form_data.get("apt") or ""
            full_addr = addr if not apt else f"{addr} Apt {apt}"
            f["value"] = full_addr
        elif "city or post office" in alt and "city" in form_data:
            f["value"] = form_data["city"]
        elif "2-digit state abbreviation" in alt and "state" in form_data:
            f["value"] = form_data["state"]
        elif "zip code" in alt and "zipCode" in form_data:
            f["value"] = form_data["zipCode"]
        elif "phone number" in alt and "phoneNumber" in form_data:
            f["value"] = form_data["phoneNumber"]
        elif alt == "email" and "email" in form_data:
            f["value"] = form_data["email"]

        # Apt.가 따로 있을 수도 있으니 보조 처리
        elif "apt" in alt and "apt" in form_data:
            f["value"] = form_data["apt"]

        # 소득 관련
        elif "wages, salaries, tips, etc." in alt and "wages" in form_data:
            f["value"] = str(form_data["wages"])
        elif "taxable interest" in alt and "taxableInterest" in form_data:
            f["value"] = str(form_data["taxableInterest"])
        elif "ordinary dividends" in alt and "ordinaryDividends" in form_data:
            f["value"] = str(form_data["ordinaryDividends"])
        elif "capital gain" in alt and "capitalGains" in form_data:
            f["value"] = str(form_data["capitalGains"])
        elif "business income" in alt and "businessIncome" in form_data:
            f["value"] = str(form_data["businessIncome"])
        elif "other income" in alt and "otherIncome" in form_data:
            f["value"] = str(form_data["otherIncome"])
        elif "unemployment compensation" in alt and "unemploymentCompensation" in form_data:
            f["value"] = str(form_data["unemploymentCompensation"])

        # 필요하면 alt_raw / pdf_name 기반으로 추가 매핑 가능
        # ex) if pdf_name == "line32a": ...


def fill_ssn_and_dob(fields, form_data: Dict[str, Any]) -> None:
    pdf_names = {f.get("pdf_name"): f for f in fields}

    # SSN 3칸
    ssn = form_data.get("ssn")
    if ssn:
        a, b, c = parse_ssn(ssn)
        if "ss3" in pdf_names:
            pdf_names["ss3"]["value"] = a
        if "ss2" in pdf_names:
            pdf_names["ss2"]["value"] = b
        if "ss4" in pdf_names:
            pdf_names["ss4"]["value"] = c

    # DOB 8칸
    dob = form_data.get("dateOfBirth")
    if dob:
        mm, dd, yyyy = parse_dob_yyyy_mm_dd(dob)
        needed = ["m1", "m2", "d1", "d2", "y1", "y2", "y3", "y4"]
        if all(n in pdf_names for n in needed) and mm and dd and yyyy:
            pdf_names["m1"]["value"] = mm[0]
            pdf_names["m2"]["value"] = mm[1]
            pdf_names["d1"]["value"] = dd[0]
            pdf_names["d2"]["value"] = dd[1]
            pdf_names["y1"]["value"] = yyyy[0]
            pdf_names["y2"]["value"] = yyyy[1]
            pdf_names["y3"]["value"] = yyyy[2]
            pdf_names["y4"]["value"] = yyyy[3]


def fill_checkboxes(fields, form_data: Dict[str, Any]) -> None:
    """
    /Btn 필드 중에서 filingStatus 같은 것 체크.
    전략:
      - formData.filingStatus (예: "single")를 normalize 한 문자열과
      - 각 필드의 alt_name / pdf_name 을 normalize 한 문자열을 비교.
      - 완전 일치(nlab == desired) 뿐 아니라 부분 포함(desired in nlab)도 허용.
    """
    raw_status = form_data.get("filingStatus") or ""
    desired = normalize(raw_status)  # -> "single", "marriedfilingseparately" 이런 식
    if not desired:
        return

    for f in fields:
        if f.get("type") != "/Btn":
            continue

        alt = f.get("alt_name") or ""
        pdf_name = f.get("pdf_name") or ""

        for lab in (alt, pdf_name):
            nlab = normalize(lab)  # 전부 소문자 + 공백 제거
            if not nlab:
                continue

            # 예: desired = "single", nlab = "single(seeinstructions)"
            if nlab == desired or desired in nlab:
                f["checked"] = True
                # 그룹 내 나머지는 건드리지 않음
                break


def main():
    parser = argparse.ArgumentParser(
        description="Merge form_input.json into 1npr_fields_dump.json to create filled AcroForm JSON."
    )
    parser.add_argument("dump_json", help="dump_1npr_fileds.py 결과 JSON (예: 1npr_fields_dump.json)")
    parser.add_argument("form_input", help="form_input.json (백엔드 formData 구조)")
    parser.add_argument(
        "-o",
        "--output",
        default="1npr_fields_dump_filled.json",
        help="채워진 dump JSON 출력 이름 (기본: 1npr_fields_dump_filled.json)",
    )
    args = parser.parse_args()

    dump_path = Path(args.dump_json)
    form_path = Path(args.form_input)
    out_path = Path(args.output)

    if not dump_path.exists():
        raise FileNotFoundError(dump_path)
    if not form_path.exists():
        raise FileNotFoundError(form_path)

    dump_data = load_json(dump_path)
    raw_input = load_json(form_path)
    form_data = raw_input.get("formData", {})

    fields = dump_data.get("fields", [])

    # 1) 텍스트 필드 채우기
    fill_text_fields(fields, form_data)
    # 2) SSN / DOB 쪼개서 채우기
    fill_ssn_and_dob(fields, form_data)
    # 3) 체크박스(예: filingStatus) 채우기
    fill_checkboxes(fields, form_data)

    # 결과 저장
    out_path.write_text(json.dumps(dump_data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[INFO] Filled dump JSON saved to: {out_path}")


if __name__ == "__main__":
    main()
