# Fara'id AI — Islamic Inheritance Calculator

Full-stack app: **FastAPI + SQLite** backend with a real Fara'id (Islamic
inheritance) calculation engine, and a **React (Vite + Tailwind v4)**
frontend implementing the 5-step wizard (Estate → Deductions → Wasiyyah →
Heirs → Result) with a language switcher (Hausa, English, Français,
العربية, Yorùbá).

## Project structure

```
faraid-ai/
├── backend/          FastAPI app (Python)
│   └── app/
│       ├── main.py
│       ├── database.py       # SQLite via SQLAlchemy
│       ├── models.py         # Case model
│       ├── schemas.py        # Pydantic request/response models
│       ├── faraid_engine.py  # Core inheritance-share calculation logic
│       └── routers/cases.py  # /api/calculate, /api/cases CRUD
└── frontend/          React + Vite + Tailwind
    └── src/
        ├── App.jsx
        ├── api.js
        ├── i18n/              translations + language context
        └── components/        step wizard UI pieces
```

## Running it

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API runs at `http://localhost:8000`, docs at `http://localhost:8000/docs`.
A `faraid.db` SQLite file is created automatically on first run.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`. It talks to the backend at the URL in
`frontend/.env` (`VITE_API_URL`, defaults to `http://localhost:8000/api`).

## What the Fara'id engine covers

Implements classical Sunni (majority) rules: fixed shares (fara'id),
residue/asaba distribution, 'awl (proportional reduction when shares are
over-subscribed) and radd (return of leftover when no residuary heir
exists). Supported heirs: husband, wife, son, daughter, father, mother,
full/paternal-half/maternal-half siblings, and paternal grandfather /
grandmothers as substitutes when parents are absent.

It has been checked against several classical textbook cases (the two
"Umariyyatain" cases, a standard 'awl case, and a radd case) and matches
the known results exactly — see `backend/app/faraid_engine.py` docstring
for the full list of edge cases it does **not** model (e.g. grandchildren,
uncles, multi-generation ascendants). Disputed scenarios (e.g. grandfather
co-existing with siblings) are flagged in the API response's `notes` /
`needs_scholar_review` fields rather than silently resolved — this mirrors
the app's own "scholar-aligned" positioning, so always keep a scholar in
the loop for unusual heir combinations.

## Extending languages

Add a new language by adding an entry to `LANGUAGES` and a matching
translation object in `frontend/src/i18n/translations.js` (e.g. `hi`,
`zh` for the Hindi/Chinese options shown in your language picker).
