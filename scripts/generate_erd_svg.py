from html import escape
from pathlib import Path


TABLE_WIDTH = 500
HEADER_HEIGHT = 42
ROW_HEIGHT = 24
MARGIN = 24
GAP_X = 56
GAP_Y = 56


tables = [
    {
        "name": "users",
        "title": "사용자",
        "x": 40,
        "y": 40,
        "columns": [
            ("사용자 ID", "user_id", "INTEGER", "NN", "PK, Auto"),
            ("사용자 이메일", "user_email", "STRING", "NN", "UNIQUE"),
            ("비밀번호 해시", "pw_hash", "STRING", "NN", ""),
            ("사용자명", "user_name", "STRING", "NN", ""),
            ("역할", "role", "STRING", "NN", ""),
            ("생성일시", "created_at", "TIMESTAMP TZ", "NN", "DEF now()"),
        ],
    },
    {
        "name": "positions",
        "title": "포지션",
        "x": 596,
        "y": 40,
        "columns": [
            ("포지션 ID", "position_id", "INTEGER", "NN", "PK, Auto"),
            ("포지션명", "position_name", "VARCHAR(100)", "NN", ""),
            ("생성일시", "created_at", "TIMESTAMP TZ", "NN", "DEF now()"),
        ],
    },
    {
        "name": "email_templates",
        "title": "이메일 템플릿",
        "x": 1152,
        "y": 40,
        "columns": [
            ("템플릿 ID", "id", "INTEGER", "NN", "PK, Auto"),
            ("템플릿명", "name", "VARCHAR(100)", "NN", ""),
            ("메일 제목", "subject", "VARCHAR(255)", "NN", ""),
            ("메일 본문", "body", "TEXT", "NN", ""),
        ],
    },
    {
        "name": "candidates",
        "title": "지원자",
        "x": 40,
        "y": 290,
        "columns": [
            ("지원자 ID", "candidate_id", "INTEGER", "NN", "PK, Auto"),
            ("지원 포지션 ID", "position_id", "INTEGER", "NULL", "FK"),
            ("이름", "name", "VARCHAR(255)", "NULL", ""),
            ("생년월일", "date_of_birth", "DATE", "NULL", ""),
            ("성별", "gender", "VARCHAR(100)", "NULL", ""),
            ("주소", "address", "VARCHAR(2000)", "NULL", ""),
            ("전화번호", "phone", "VARCHAR(100)", "NULL", ""),
            ("이메일", "email", "VARCHAR(255)", "NULL", ""),
            ("경력 구분", "experience_level", "VARCHAR(20)", "NN", "DEF 신입"),
            ("지원 단계", "application_status", "VARCHAR(20)", "NN", ""),
            ("최종 상태", "final_status", "VARCHAR(20)", "NN", "DEF 진행중"),
            ("우대조건 충족", "meets_preferred_criteria", "JSONB", "NN", "DEF []"),
            ("생성일시", "created_at", "TIMESTAMP TZ", "NN", "DEF now()"),
            ("수정일시", "updated_at", "TIMESTAMP TZ", "NN", "UPD now()"),
        ],
    },
    {
        "name": "resumes",
        "title": "이력서",
        "x": 596,
        "y": 290,
        "columns": [
            ("이력서 ID", "resume_id", "INTEGER", "NN", "PK, Auto"),
            ("지원자 ID", "candidate_id", "INTEGER", "NN", "FK"),
            ("희망 근무지", "desired_location", "VARCHAR(100)", "NULL", ""),
            ("희망 연봉", "desired_salary", "INTEGER", "NULL", ""),
            ("파일 경로", "file_path", "VARCHAR(500)", "NULL", ""),
            ("원문 텍스트", "raw_text", "TEXT", "NULL", ""),
            ("파싱 JSON", "parsed_json", "JSONB", "NULL", ""),
            ("요약", "summary", "TEXT", "NULL", ""),
            ("AI 프로필", "ai_profile", "JSONB", "NULL", ""),
            ("생성일시", "created_at", "TIMESTAMP TZ", "NN", "DEF now()"),
            ("수정일시", "updated_at", "TIMESTAMP TZ", "NN", "UPD now()"),
        ],
    },
    {
        "name": "interviewers",
        "title": "면접관",
        "x": 1152,
        "y": 290,
        "columns": [
            ("면접관 ID", "interviewer_id", "INTEGER", "NN", "PK, Auto"),
            ("면접관 이메일", "interviewer_email", "STRING", "NN", ""),
            ("면접관 이름", "interviewer_name", "STRING", "NN", ""),
            ("담당 포지션 ID", "position_id", "INTEGER", "NULL", "FK"),
            ("담당 라운드", "interview_round", "VARCHAR(20)", "NULL", "CHK 1/2/3차"),
            ("생성일시", "created_at", "TIMESTAMP TZ", "NN", "DEF now()"),
        ],
    },
    {
        "name": "questions",
        "title": "질문",
        "x": 1708,
        "y": 290,
        "columns": [
            ("질문 ID", "question_id", "INTEGER", "NN", "PK, Auto"),
            ("지원자 ID", "candidate_id", "INTEGER", "NULL", "FK"),
            ("포지션 ID", "position_id", "INTEGER", "NULL", "FK"),
            ("질문 내용", "question_text", "TEXT", "NN", ""),
            ("질문 유형", "question_type", "VARCHAR(30)", "NN", ""),
            ("평가 의도", "evaluation_intent", "TEXT", "NULL", ""),
            ("생성 근거", "generation_basis", "TEXT", "NULL", ""),
            ("생성일시", "created_at", "TIMESTAMP TZ", "NN", "DEF now()"),
            ("작성 사용자 ID", "created_by_user_id", "INTEGER", "NULL", "FK"),
            ("작성 면접관 ID", "created_by_interviewer_id", "INTEGER", "NULL", "FK"),
        ],
    },
    {
        "name": "interviewer_invites",
        "title": "면접관 초대",
        "x": 1152,
        "y": 610,
        "columns": [
            ("초대 ID", "invite_id", "INTEGER", "NN", "PK, Auto"),
            ("면접관 ID", "interviewer_id", "INTEGER", "NN", "FK"),
            ("토큰 해시", "token_hash", "VARCHAR(128)", "NN", "UNIQUE"),
            ("원본 토큰", "raw_token", "VARCHAR(256)", "NULL", ""),
            ("만료일시", "expires_at", "TIMESTAMP TZ", "NN", ""),
            ("철회일시", "revoked_at", "TIMESTAMP TZ", "NULL", ""),
            ("마지막 사용일시", "last_used_at", "TIMESTAMP TZ", "NULL", ""),
            ("생성 사용자 ID", "created_by_user_id", "INTEGER", "NULL", "FK"),
            ("생성일시", "created_at", "TIMESTAMP TZ", "NN", "DEF now()"),
        ],
    },
    {
        "name": "interview_slots",
        "title": "면접 슬롯",
        "x": 596,
        "y": 770,
        "columns": [
            ("슬롯 ID", "slot_id", "INTEGER", "NN", "PK, Auto"),
            ("포지션 ID", "position_id", "INTEGER", "NULL", "FK"),
            ("면접 라운드", "interview_round", "VARCHAR(20)", "NN", "CHK 1/2/3차"),
            ("면접 시작일시", "interview_starts_at", "TIMESTAMP TZ", "NN", ""),
            ("면접 종료일시", "interview_ends_at", "TIMESTAMP TZ", "NN", ""),
            ("예약 마감일시", "booking_deadline_at", "TIMESTAMP TZ", "NULL", ""),
            ("면접 장소", "interview_location", "VARCHAR(255)", "NULL", ""),
            ("수용 인원", "capacity", "INTEGER", "NN", ""),
            ("슬롯 상태", "slot_status", "VARCHAR(20)", "NN", "DEF open"),
            ("생성일시", "created_at", "TIMESTAMP TZ", "NN", "DEF now()"),
        ],
    },
    {
        "name": "interview_slot_interviewers",
        "title": "슬롯-면접관 매핑",
        "x": 1152,
        "y": 920,
        "columns": [
            ("매핑 ID", "id", "INTEGER", "NN", "PK, Auto"),
            ("슬롯 ID", "slot_id", "INTEGER", "NN", "FK"),
            ("면접관 ID", "interviewer_id", "INTEGER", "NN", "FK"),
            ("생성일시", "created_at", "TIMESTAMP TZ", "NN", "DEF now()"),
            ("복합 유니크", "(slot_id, interviewer_id)", "-", "-", "UNIQUE"),
        ],
    },
    {
        "name": "interview_bookings",
        "title": "면접 예약",
        "x": 40,
        "y": 1040,
        "columns": [
            ("예약 ID", "booking_id", "INTEGER", "NN", "PK, Auto"),
            ("슬롯 ID", "slot_id", "INTEGER", "NN", "FK"),
            ("지원자 ID", "candidate_id", "INTEGER", "NN", "FK"),
            ("생성일시", "created_at", "TIMESTAMP TZ", "NN", "DEF now()"),
            ("취소일시", "cancelled_at", "TIMESTAMP TZ", "NULL", ""),
        ],
    },
    {
        "name": "interview_booking_invitations",
        "title": "예약 초대",
        "x": 596,
        "y": 1120,
        "columns": [
            ("초대 ID", "invitation_id", "INTEGER", "NN", "PK, Auto"),
            ("지원자 ID", "candidate_id", "INTEGER", "NN", "FK"),
            ("토큰 해시", "token_hash", "VARCHAR(64)", "NN", "UNIQUE"),
            ("만료일시", "expires_at", "TIMESTAMP TZ", "NN", ""),
            ("허용 슬롯 ID 목록", "allowed_slot_ids", "JSON", "NULL", ""),
            ("철회일시", "revoked_at", "TIMESTAMP TZ", "NULL", ""),
            ("생성일시", "created_at", "TIMESTAMP TZ", "NN", "DEF now()"),
        ],
    },
    {
        "name": "question_generation_jobs",
        "title": "질문 생성 작업",
        "x": 1152,
        "y": 1170,
        "columns": [
            ("작업 ID", "job_id", "INTEGER", "NN", "PK, Auto"),
            ("상태", "status", "VARCHAR(20)", "NN", "DEF queued"),
            ("지원자 ID", "candidate_id", "INTEGER", "NN", "FK"),
            ("포지션 ID", "position_id", "INTEGER", "NULL", "FK"),
            ("생성 요청 사용자 ID", "created_by_user_id", "INTEGER", "NULL", "FK"),
            ("생성 요청 면접관 ID", "created_by_interviewer_id", "INTEGER", "NULL", "FK"),
            ("요청 페이로드", "request_payload", "JSON", "NN", ""),
            ("생성 결과 질문", "result_questions", "JSON", "NULL", ""),
            ("오류 메시지", "error_message", "TEXT", "NULL", ""),
            ("생성일시", "created_at", "TIMESTAMP TZ", "NN", "DEF now()"),
            ("시작일시", "started_at", "TIMESTAMP TZ", "NULL", ""),
            ("종료일시", "finished_at", "TIMESTAMP TZ", "NULL", ""),
        ],
    },
]


relations = [
    ("users", "questions"),
    ("users", "interviewer_invites"),
    ("users", "question_generation_jobs"),
    ("positions", "candidates"),
    ("positions", "questions"),
    ("positions", "interviewers"),
    ("positions", "interview_slots"),
    ("positions", "question_generation_jobs"),
    ("candidates", "resumes"),
    ("candidates", "questions"),
    ("candidates", "interview_bookings"),
    ("candidates", "interview_booking_invitations"),
    ("candidates", "question_generation_jobs"),
    ("interviewers", "questions"),
    ("interviewers", "interviewer_invites"),
    ("interviewers", "question_generation_jobs"),
    ("interview_slots", "interview_bookings"),
    ("interview_slots", "interview_slot_interviewers"),
    ("interviewers", "interview_slot_interviewers"),
]


table_map = {table["name"]: table for table in tables}


for table in tables:
    table["height"] = HEADER_HEIGHT + ROW_HEIGHT * (len(table["columns"]) + 1)


def center_right(table):
    return table["x"] + TABLE_WIDTH, table["y"] + table["height"] / 2


def center_left(table):
    return table["x"], table["y"] + table["height"] / 2


def center_top(table):
    return table["x"] + TABLE_WIDTH / 2, table["y"]


def center_bottom(table):
    return table["x"] + TABLE_WIDTH / 2, table["y"] + table["height"]


def route_points(src, dst):
    sx, sy = center_right(src)
    dx, dy = center_left(dst)
    if src["x"] < dst["x"]:
        mid_x = (sx + dx) / 2
        return [(sx, sy), (mid_x, sy), (mid_x, dy), (dx, dy)]

    sx, sy = center_bottom(src)
    dx, dy = center_top(dst)
    mid_y = (sy + dy) / 2
    return [(sx, sy), (sx, mid_y), (dx, mid_y), (dx, dy)]


def crowfoot(x, y, direction):
    if direction == "left":
        return (
            f"<line x1='{x}' y1='{y}' x2='{x+16}' y2='{y-10}' class='rel'/>"
            f"<line x1='{x}' y1='{y}' x2='{x+16}' y2='{y+10}' class='rel'/>"
            f"<line x1='{x}' y1='{y}' x2='{x+16}' y2='{y}' class='rel'/>"
        )
    if direction == "right":
        return (
            f"<line x1='{x}' y1='{y}' x2='{x-16}' y2='{y-10}' class='rel'/>"
            f"<line x1='{x}' y1='{y}' x2='{x-16}' y2='{y+10}' class='rel'/>"
            f"<line x1='{x}' y1='{y}' x2='{x-16}' y2='{y}' class='rel'/>"
        )
    if direction == "up":
        return (
            f"<line x1='{x}' y1='{y}' x2='{x-10}' y2='{y+16}' class='rel'/>"
            f"<line x1='{x}' y1='{y}' x2='{x+10}' y2='{y+16}' class='rel'/>"
            f"<line x1='{x}' y1='{y}' x2='{x}' y2='{y+16}' class='rel'/>"
        )
    return (
        f"<line x1='{x}' y1='{y}' x2='{x-10}' y2='{y-16}' class='rel'/>"
        f"<line x1='{x}' y1='{y}' x2='{x+10}' y2='{y-16}' class='rel'/>"
        f"<line x1='{x}' y1='{y}' x2='{x}' y2='{y-16}' class='rel'/>"
    )


canvas_width = 2280
canvas_height = 1620


parts = [
    f"""<svg xmlns="http://www.w3.org/2000/svg" width="{canvas_width}" height="{canvas_height}" viewBox="0 0 {canvas_width} {canvas_height}">
<defs>
  <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#eef2f7" stroke-width="1"/>
  </pattern>
  <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
    <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#94a3b8" flood-opacity="0.16"/>
  </filter>
</defs>
<rect width="100%" height="100%" fill="#f8fbff"/>
<rect width="100%" height="100%" fill="url(#grid)"/>
<text x="40" y="32" class="title">HRProject Database ERD</text>
<style>
  .title {{ font: 700 22px 'Malgun Gothic', 'Noto Sans KR', sans-serif; fill: #0f172a; }}
  .table-shadow {{ filter: url(#shadow); }}
  .table-bg {{ fill: #ffffff; stroke: #cbd5e1; stroke-width: 1.2; rx: 14; }}
  .table-header {{ fill: #2563eb; rx: 14; }}
  .table-name {{ font: 700 18px 'Malgun Gothic', 'Noto Sans KR', sans-serif; fill: white; }}
  .table-sub {{ font: 600 11px 'Consolas', 'Segoe UI Mono', monospace; fill: #dbeafe; }}
  .head {{ font: 700 11px 'Malgun Gothic', 'Noto Sans KR', sans-serif; fill: #475569; }}
  .label {{ font: 600 11px 'Malgun Gothic', 'Noto Sans KR', sans-serif; fill: #0f172a; }}
  .code {{ font: 11px 'Consolas', 'Segoe UI Mono', monospace; fill: #334155; }}
  .mini {{ font: 10px 'Consolas', 'Segoe UI Mono', monospace; fill: #475569; }}
  .rel {{ stroke: #64748b; stroke-width: 2.2; fill: none; stroke-linecap: round; stroke-linejoin: round; }}
</style>
"""
]


for src_name, dst_name in relations:
    src = table_map[src_name]
    dst = table_map[dst_name]
    pts = route_points(src, dst)
    d = "M " + " L ".join(f"{x} {y}" for x, y in pts)
    parts.append(f"<path d='{d}' class='rel'/>")
    if src["x"] < dst["x"]:
        parts.append(crowfoot(pts[-1][0], pts[-1][1], "left"))
        parts.append(f"<line x1='{pts[0][0]}' y1='{pts[0][1]-8}' x2='{pts[0][0]}' y2='{pts[0][1]+8}' class='rel'/>")
    else:
        parts.append(crowfoot(pts[-1][0], pts[-1][1], "up"))
        parts.append(f"<line x1='{pts[0][0]-8}' y1='{pts[0][1]}' x2='{pts[0][0]+8}' y2='{pts[0][1]}' class='rel'/>")


for table in tables:
    x = table["x"]
    y = table["y"]
    h = table["height"]
    parts.append(f"<g class='table-shadow'>")
    parts.append(f"<rect x='{x}' y='{y}' width='{TABLE_WIDTH}' height='{h}' class='table-bg'/>")
    parts.append(f"<rect x='{x}' y='{y}' width='{TABLE_WIDTH}' height='{HEADER_HEIGHT}' class='table-header'/>")
    parts.append(f"<text x='{x + 18}' y='{y + 24}' class='table-name'>{escape(table['name'])}</text>")
    parts.append(f"<text x='{x + TABLE_WIDTH - 18}' y='{y + 24}' text-anchor='end' class='table-sub'>{escape(table['title'])}</text>")
    head_y = y + HEADER_HEIGHT + 17
    parts.append(f"<text x='{x + 14}' y='{head_y}' class='head'>한글명</text>")
    parts.append(f"<text x='{x + 150}' y='{head_y}' class='head'>영문명</text>")
    parts.append(f"<text x='{x + 310}' y='{head_y}' class='head'>TYPE</text>")
    parts.append(f"<text x='{x + 400}' y='{head_y}' class='head'>NULL</text>")
    parts.append(f"<text x='{x + 450}' y='{head_y}' class='head'>제약</text>")
    for idx, row in enumerate(table["columns"], start=1):
        ry = y + HEADER_HEIGHT + idx * ROW_HEIGHT
        parts.append(f"<line x1='{x}' y1='{ry}' x2='{x + TABLE_WIDTH}' y2='{ry}' stroke='#e2e8f0' stroke-width='1'/>")
        cy = ry + 16
        parts.append(f"<text x='{x + 14}' y='{cy}' class='label'>{escape(row[0])}</text>")
        parts.append(f"<text x='{x + 150}' y='{cy}' class='code'>{escape(row[1])}</text>")
        parts.append(f"<text x='{x + 310}' y='{cy}' class='mini'>{escape(row[2])}</text>")
        parts.append(f"<text x='{x + 400}' y='{cy}' class='mini'>{escape(row[3])}</text>")
        parts.append(f"<text x='{x + 450}' y='{cy}' class='mini'>{escape(row[4])}</text>")
    parts.append("</g>")


parts.append("</svg>")

output = "".join(parts)
Path("HRProject_ERD.svg").write_text(output, encoding="utf-8")
print("Generated HRProject_ERD.svg")
