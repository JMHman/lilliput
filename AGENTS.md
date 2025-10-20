# Repository Guidelines

## 언어 & 스타일 지침
- 문서, 이슈, PR 설명, 리뷰 코멘트의 **기본 언어는 한국어**로 한다.
- 코드 주석은 간결한 한국어를 기본으로 하되, 공개 라이브러리/오픈소스에 기여하는 코드는 영어 주석을 허용한다.
- 자동 생성 텍스트(변경 계획, 리뷰 리포트 등)도 한국어를 우선 사용한다. 필요한 경우 마지막에 영어 한 줄 요약을 덧붙인다.

## Codex 작업 규칙
- 제안/리포트/변경 설명을 **한국어**로 출력한다.
- 파일 생성/수정 시, 헤더 주석에 변경 의도를 한 줄 한국어로 덧붙인다.
- 위험 작업(DB 마이그레이션 수정, 삭제 명령, 배포 스크립트 변경)은 **반드시 승인 요청** 단계로 남긴다.


## Project Structure & Module Organization
- `src/` hosts the React client; keep shared UI in `src/components/`, route views in `src/pages/`, and data helpers in `src/data/`.
- `public/` stores static assets served by Vite; update favicons or manifests here.
- `backend/app/` contains the FastAPI service (routers, models, CRUD logic); place new endpoints in `backend/app/routers/` with matching schemas in `backend/app/schemas.py`.
- Alembic migration scripts live in `backend/backend/migrations/`; builds from `npm run build:admin` land in `backend/static/admin/` for the API to serve.

## Build, Test, and Development Commands
- `npm run dev` launches Vite on http://localhost:5173 with hot reloading; reinstall dependencies with `npm install` when packages change.
- `npm run build:admin` emits the admin bundle into `backend/static/admin/` and `npm run preview` serves the production build for smoke checks.
- `poetry install` installs backend dependencies; `poetry run uvicorn backend.app.main:app --reload` starts the API.
- `docker compose -f backend/docker-compose.yml up -d db` boots Postgres; run `poetry run alembic upgrade head` to apply migrations.

## Coding Style & Naming Conventions
- Frontend linting follows `eslint.config.js` (ESLint recommended + React hooks); keep 2-space indentation, semicolons optional, React components in PascalCase (`WaitingList.jsx`), and hooks/callbacks camelCase.
- Python modules follow PEP 8 with type hints, `snake_case` functions, and SQLAlchemy models in PascalCase; reuse `backend/app/store.py` or `crud.py` for database access.
- Migration filenames follow `<revision>_<slug>.py`; ensure upgrades and downgrades remain idempotent and reversible.

## Testing Guidelines
- Add backend tests under `backend/tests/` with `pytest` and FastAPI's `TestClient`; run via `poetry run pytest` and add the dependency to `pyproject.toml` if it is not yet listed.
- Frontend component tests belong in `src/__tests__/` using Vitest + React Testing Library; add Vitest as a dev dependency and execute with `npx vitest run --coverage`.
- Prefer fixtures representing waiting-room scenarios and favor in-memory databases (`DATABASE_URL=sqlite://`) to isolate tests from the Postgres container.

## Commit & Pull Request Guidelines
- Keep commits small, imperative, and lower-case (e.g., `feat: add waiting queue filter`); the existing history favors concise summaries.
- Reference related issues, call out schema or migration changes, and note manual steps such as `npm run build:admin`.
- PRs need a short narrative, testing notes, screenshots or recordings for UI tweaks, and confirmation that migrations ran successfully.

## Environment & Configuration
- Create `backend/.env` with `DATABASE_URL=postgresql+psycopg://lilliput:lilliput_pw@localhost:5432/lilliput`; keep secrets out of version control.
- When adding configuration keys, document them in the PR and update `backend/app/database.py` or related loaders as needed.
