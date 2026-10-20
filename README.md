# EquiAgentic - Multi-Agent Stock Research Platform

An institutional-grade research platform for NSE & BSE Indian equities powered by an adversarial **13-agent deliberation loop**, **LangGraph** orchestration, deterministic financial math, and local/remote LLM reasoning (e.g. Qwen 2.5 Coder via Ollama).

---

## What is EquiAgentic?

EquiAgentic moves beyond simple chatbot summaries by simulating an institutional investment committee:
- **13 Specialized Agent Roles**: Fundamentals, Growth, News/Events, Sentiment, Market Microstructure, Valuation, Risk, Trader, and Portfolio Manager.
- **Adversarial Bull vs Bear Debate**: Isolated bull and bear researchers craft independent theses, then challenge each other in an adversarial rebuttal round.
- **Deterministic Math Engine**: Computes Debt/Equity, Interest Coverage, ROCE-WACC spread, and PEG ratios in Python to eliminate LLM arithmetic hallucinations.
- **7,800+ Official NSE & BSE Catalog**: Real securities database with exchange disambiguation, ISIN lookup, and scrip mapping.

---

## System Architecture

```text
EquiAgentic/
├── backend/
│   ├── agents/                     # LangGraph Multi-Agent Engine
│   │   ├── orchestrator.py         # StateGraph workflow (5 stages, safe parallel state merging)
│   │   ├── analysts.py             # 7 foundational specialist agents (Evidence, Fundamentals, etc.)
│   │   ├── decision_makers.py      # Bull, Bear, Risk, Trader, and Portfolio Manager agents
│   │   ├── metrics.py              # Deterministic financial ratio calculator (Debt/Equity, ROCE, PEG)
│   │   ├── base.py                 # Abstract BaseAgent, AgentOutput schema, and error containment
│   │   └── llm.py                  # Ollama / OpenAI API client with JSON schema enforcement
│   ├── data_providers/             # Free Data Connectors (Zero API Keys)
│   │   ├── aggregator.py           # Unified concurrent context enricher
│   │   ├── yfinance_provider.py    # Live price, 50/200 DMA, 52W range, P/E, P&L, Balance Sheet
│   │   ├── news_provider.py        # Live Google News RSS feed for Indian stocks
│   │   └── bse_provider.py         # Official BSE corporate filings & announcements API
│   ├── catalog_importer.py         # CSV & Excel importer for official NSE/BSE securities masters
│   ├── import_catalog.py           # Reusable CLI utility for batch importing exchange catalogs
│   ├── database.py                 # SQLite database connection, indexing, and search queries
│   ├── main.py                     # FastAPI REST API endpoints
│   ├── schemas.py                  # Pydantic v2 data models
│   ├── test_catalog.py             # Catalog import and search test suite
│   ├── test_agents.py              # Multi-agent LangGraph test suite
│   ├── requirements.txt            # Python dependencies
│   └── .env                        # Local backend configuration
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx          # Header with connection badge & branding
│   │   │   ├── SearchBar.tsx       # Search by Symbol, Name, or 12-digit ISIN + Exchange filters
│   │   │   ├── StockCard.tsx       # Summary card with exchange tags & ISIN badge
│   │   │   ├── StockProfile.tsx    # Exchange-specific stock profile & "Generate Full Report" button
│   │   │   ├── ReportView.tsx      # Multi-agent report view: Bull vs Bear debate & audit trail
│   │   │   └── StateFeedback.tsx   # Loading, empty, and catalog notice states
│   │   ├── api.ts                  # Typed Axios/Fetch client
│   │   ├── types.ts                # TypeScript interfaces matching backend models
│   │   ├── App.tsx                 # Main layout & view routing
│   │   └── index.css               # Tailwind CSS styles & dark theme design system
│   ├── vite.config.ts              # Vite server with API proxy to localhost:8000
│   └── package.json                # Frontend dependencies
├── .env.example                    # Environment variables template
└── README.md                       # Documentation & setup guide
```

---

## Quickstart Guide (Beginner Friendly)

Follow these steps to get EquiAgentic running locally on your computer.

### Step 1: Check Prerequisites

Make sure you have the following installed:
1. **Python** (version 3.10 or higher) — [Download Python](https://www.python.org/downloads/)
2. **Node.js** (version 18 or higher) — [Download Node.js](https://nodejs.org/)
3. **Git** — [Download Git](https://git-scm.com/)
4. *(Optional for local AI)* **Ollama** — [Download Ollama](https://ollama.ai/)

---

### Step 2: Clone the Repository

```bash
git clone https://github.com/piyu503/Multi-Agent-Stock-Analyzer.git
cd Multi-Agent-Stock-Analyzer
```

---

### Step 3: Setup the Backend (Python)

1. Open a terminal and enter the `backend` folder:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   # Windows (PowerShell or Command Prompt):
   python -m venv venv

   # macOS / Linux:
   python3 -m venv venv
   ```

3. Activate the virtual environment:
   ```bash
   # Windows PowerShell:
   .\venv\Scripts\Activate.ps1

   # Windows Command Prompt:
   .\venv\Scripts\activate.bat

   # macOS / Linux:
   source venv/bin/activate
   ```

4. Install the required libraries:
   ```bash
   pip install -r requirements.txt
   ```

5. *(Optional)* Configure your LLM in `backend/.env`:
   If you want to use local Ollama with `qwen2.5-coder:7b`:
   ```dotenv
   LLM_PROVIDER=ollama
   LLM_BASE_URL=http://localhost:11434/v1
   LLM_MODEL=qwen2.5-coder:7b
   LLM_TEMPERATURE=0.2
   ```
   > **Note:** If Ollama is not running, the platform runs in **Development Mode**, returning analytical stubs and pre-calculated deterministic ratios without errors.

6. Start the backend server:
   ```bash
   uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```
   The backend is now live at `http://127.0.0.1:8000`. You can visit `http://127.0.0.1:8000/docs` to see the interactive Swagger API documentation.

---

### Step 4: Setup the Frontend (React + Vite)

Open a **new, separate terminal** in the project root:

1. Enter the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```text
   http://localhost:5173/
   ```

---

## Importing the Full NSE & BSE Stock Universe

EquiAgentic comes preloaded with sample securities. To import the complete official universe of 7,800+ NSE and BSE stocks:

In your `backend` terminal (with virtual environment activated):

```bash
# Ingest official NSE equity list
python import_catalog.py --file data/sample_nse_equities.csv --exchange NSE

# Ingest official BSE scrip master
python import_catalog.py --file data/sample_bse_equities.csv --exchange BSE
```

**Catalog Importer Features:**
- **Idempotent**: Safely re-run imports without creating duplicate records.
- **Exchange Disambiguation**: Correctly identifies whether a stock is on NSE, BSE, or dual-listed.
- **ISIN Linking**: Accurately links company profiles sharing the same 12-digit ISIN (e.g., `INE002A01018` for Reliance).

---

## Running Automated Tests

Run the backend test suite to verify data imports, search queries, and multi-agent orchestration:

```bash
cd backend
.\venv\Scripts\pytest.exe test_catalog.py test_agents.py -v
```

All 16 unit and integration tests will run and display green checkmarks.

---

## The 13 Specialized Agent Roles

| Stage | Role | Focus |
| :--- | :--- | :--- |
| **0. Planning** | **Research Manager** | Scopes investment hypotheses and coordinates dependencies. |
| **1. Evidence** | **Evidence Verification Analyst** | Audits listing parameters, exchange series, and ISIN metadata. |
| **1. Quality** | **Fundamentals Analyst** | Examines balance sheet durability, debt solvency, and cash conversion. |
| **1. Growth** | **Growth & Industry Analyst** | Analyzes market expansion, domestic tailwinds, and industry catalysts. |
| **1. Events** | **News & Corporate Events Analyst** | Scrutinizes recent BSE filings, earnings announcements, and board actions. |
| **1. Sentiment** | **Social Sentiment Analyst** | Evaluates retail investor discussions without overriding hard metrics. |
| **1. Market** | **Market Analyst** | Evaluates liquidity, 50/200 DMA, 52W range, and price momentum. |
| **1. Valuation** | **Peer & Valuation Analyst** | Compares relative multiples (P/E, P/B, EV/EBITDA, PEG) vs sector peers. |
| **2. Bull Case** | **Bull Researcher** | Constructs an independent positive thesis (isolated from Bear influence). |
| **2. Bear Case** | **Bear Researcher** | Constructs an independent downside risk thesis (isolated from Bull influence). |
| **3. Debate** | **Bull & Bear (Rebuttal)** | Single bounded round where Bull challenges Bear and Bear answers Bull. |
| **4. Risk** | **Risk Analyst** | Stress-tests debt maturity, promoter pledging, and regulatory risks. |
| **4. Execution** | **Trader Agent** | Formulates optimal accumulation pacing, entry zones, and volatility buffers. |
| **5. Synthesis** | **Portfolio Manager** | Final institutional conviction synthesis and capital allocation decision. |

---

## API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check verifying API and SQLite status |
| `GET` | `/api/stocks?q=...&exchange=...&page=...` | Search stocks by ticker, company name, or ISIN with filters |
| `GET` | `/api/stocks/{symbol}?exchange={NSE\|BSE}` | Retrieve profile for a specific exchange listing |
| `POST` | `/api/reports/{symbol}?exchange={NSE\|BSE}` | Trigger the 13-agent LangGraph research deliberation loop |
| `POST` | `/api/catalog/import?exchange={NSE\|BSE}` | Upload official exchange CSV or Excel file |

---

## License & Disclaimer

*Disclaimer: EquiAgentic is an educational and analytical research tool. It does not provide personal financial or investment advice. Always conduct your own due diligence before making investment decisions.*
