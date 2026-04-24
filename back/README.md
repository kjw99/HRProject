* 2026-04-22
* 백엔드 폴더 구조 대애애애강 잡아둠.
* 폴더에 있는 파일들은 다 수업에서 사용했던 파일들. 참고용 파일이다.

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

## 브랜치 전략
* 브랜치 전략은 main -> develop -> feature/backend-기능명, feature/frontend-기능명
* 이런 식으로 하는 것을 생각함.
```
main          ← 배포 (프로덕션)
  └── develop     ← 개발 통합 브랜치
        ├── feature/backend-auth      ← 백엔드 기능
        ├── feature/frontend-login    ← 프론트 기능
        └── feature/user-api          ← 기능 단위
```
