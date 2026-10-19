# Indian Stock Research Platform (BharatEquity)

An institutional-grade research platform prototype for NSE/BSE-listed Indian equities. Built with a FastAPI backend, an indexed SQLite store, and a modern, responsive React + Vite + TypeScript + Tailwind CSS dark-themed frontend.

---

## Architecture Overview

```text
Multi Agent Stock Analyzer/
├── backend/
│   ├── catalog_importer.py     # Importer engine for official NSE/BSE securities CSV & XLSX files
│   ├── import_catalog.py       # Reusable CLI utility for batch importing exchange catalogs
│   ├── database.py             # SQLite schema, indexing, upsert, and search logic
│   ├── main.py                 # FastAPI REST API endpoints & CORS middleware
│   ├── report_generator.py     # Prototype research report synthesis engine
│   ├── schemas.py              # Pydantic v2 data models & validation schemas
│   ├── test_catalog.py         # Pytest automated test suite (8 tests covering import & search)
│   ├── requirements.txt        # Python dependencies (fastapi, uvicorn, pydantic, openpyxl, etc.)
│   ├── data/                   # Sample official exchange catalog files (NSE & BSE)
│   └── .env                    # Local backend environment configuration
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx        # Top header with dynamic API connection status
│   │   │   ├── SearchBar.tsx     # Stock query bar with exchange filters (All, NSE, BSE)
│   │   │   ├── StockCard.tsx     # Stock summary card with exchange badges and ISIN tags
│   │   │   ├── StockProfile.tsx  # Exchange-specific company profile & "Generate Full Report" CTA
│   │   │   ├── ReportView.tsx    # Multi-section research report & Bull vs Bear debate
│   │   │   └── StateFeedback.tsx # Clean loading, error, empty & unimported catalog notice states
│   │   ├── api.ts          # Typed HTTP client communicating with backend
│   │   ├── types.ts        # TypeScript schemas matching backend models
│   │   ├── App.tsx         # Main dashboard, pagination, and workflow routing
│   │   └── index.css       # Tailwind CSS base styles & dark theme tokens
│   ├── vite.config.ts      # Vite config with API proxy to localhost:8000
│   └── package.json        # Frontend scripts and dependencies
├── .env.example            # Environment variables template
└── README.md               # Setup, catalog import instructions, and roadmap
```

---

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check verifying API, SQLite status, and catalog import status |
| `GET` | `/api/stocks?q=...&exchange=...&page=...&limit=...` | Search stocks by ticker, legal company name, or 12-digit ISIN with pagination and exchange filter (NSE/BSE) |
| `GET` | `/api/stocks/{symbol}?exchange={NSE\|BSE}` | Retrieve detailed company profile for a specific exchange listing |
| `POST` | `/api/reports/{symbol}?exchange={NSE\|BSE}` | Generate a structured demo research report for the requested stock listing |
| `POST` | `/api/catalog/import?exchange={NSE\|BSE}` | Upload official exchange securities CSV or Excel file |

---

## Quickstart & Local Setup

### 1. Prerequisites
- **Python**: 3.10+ (tested on Python 3.14)
- **Node.js**: v18+ (tested on Node v24)
- **npm**: v9+

---

### 2. Backend Setup & Running Tests

Open a terminal in `backend/`:

```bash
# Navigate to backend
cd backend

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux / macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run automated tests
pytest test_catalog.py -v

# Start the FastAPI server (default: port 8000)
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

---

### 3. Importing Official NSE & BSE Catalogs

To import official exchange securities files into SQLite:

```bash
# In backend directory with venv activated:

# Ingest official NSE equity list (e.g. EQUITIES_L.csv)
python import_catalog.py --file data/sample_nse_equities.csv --exchange NSE

# Ingest official BSE scrip master (e.g. List of Scrip CSV or Excel)
python import_catalog.py --file data/sample_bse_equities.csv --exchange BSE
```

**Importer guarantees:**
- **Idempotent**: Re-running imports updates existing records without creating duplicates.
- **Exchange Disambiguation**: Stocks with identical symbols on NSE and BSE are preserved as separate exchange-specific listings.
- **ISIN Linking**: Common underlying companies share the same 12-digit ISIN (e.g., `INE002A01018` for Reliance Industries).
- **Safe Fallbacks**: Missing optional columns (e.g., listing date, industry, or ISIN) are safely normalized without aborting the batch.

---

### 4. Frontend Setup

In a second terminal:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173/` in your browser.

---

## Phase 2 Deliverables Summary

- **Catalog Importer**: Built `backend/catalog_importer.py` and CLI tool `backend/import_catalog.py` supporting both CSV and Excel files.
- **Search API Extended**: `GET /api/stocks` now supports query matching by Company Name, Ticker, or 12-digit ISIN, alongside exchange filtering (`NSE` / `BSE`) and pagination (`page`, `limit`).
- **Disambiguated Exchange Profiles**: Profile retrieval and report endpoints disambiguate listings across exchanges using the `exchange` query parameter.
- **Frontend Refinements**:
  - Exchange toggle tabs: **All Exchanges**, **NSE**, and **BSE**.
  - Distinct exchange badges (Blue for NSE, Amber for BSE) and 12-digit ISIN indicators on stock cards.
  - Active listings count and pagination controls.
  - Notice banner indicating whether seed data or official imported catalog is active.
- **Automated Tests**: Comprehensive suite in `backend/test_catalog.py` verifying all 9 required test scenarios (idempotent imports, updates, missing fields, malformed files, ISIN/symbol search, exchange filters, profile disambiguation, and demo reports).
