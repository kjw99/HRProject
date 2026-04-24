## 백엔드 시작 방법
1. git clone을 통해 받는다.
2. uv sync를 통해 가상환경 설치.
3. notion에 있는 .env 복붙. 위치는 back 폴더에. 백엔드 readme.md랑 같은 위치임.
4. PostgreSQL에서 사용할 DB 생성(로컬 기준)
5. uv run alembic upgrade head 실행. (alembic를 실행해서 기존에 작성되어 있는 테이블 구조 적용.)
6. 서버 실행. uv run fastapi dev

## 🚨 alembic 주의사항!
1. 절대 DB를 직접 수정하지 마라. 직접 sql 들어가서 테이블 건들면 안됨!
2. 이미 공유된 마이그레이션 파일 수정, 삭제 금지!
3. DB 수정이 필요하면 팀원에게 다 공유하고 하자!

## 백엔드 계층 구조 정리
```python
backend/                        ← 프로젝트 루트
│
├── app/                        ← 실제 애플리케이션 코드
│   ├── __init__.py
│   ├── main.py
│   ├── core/                   ← app 하위 폴더
│   ├── api/                    ← app 하위 폴더
│   ├── models/                 ← app 하위 폴더
│   ├── schemas/                ← app 하위 폴더
│   ├── crud/                   ← app 하위 폴더
│   ├── services/               ← app 하위 폴더
│   └── utils/                  ← app 하위 폴더
│
├── tests/                      ← backend 하위 (app과 같은 레벨)
│   └── ...
│
├── alembic/                    ← backend 하위 (app과 같은 레벨)
│   └── versions/
│
├── .env                        ← backend 바로 아래 파일들
├── .gitignore
├── alembic.ini
├── requirements.txt
└── README.md
```
