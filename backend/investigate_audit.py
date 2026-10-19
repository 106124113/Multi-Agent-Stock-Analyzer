import sqlite3
import csv

conn = sqlite3.connect("stocks.db")
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

print("--- A. The 3 NSE records from sample_nse_equities.csv ---")
cursor.execute("SELECT id, symbol, company_name, exchange, isin, data_source FROM stocks WHERE data_source LIKE '%sample_nse%'")
print([dict(r) for r in cursor.fetchall()])

print("\n--- B. Inspecting sample of 50 BSE records from sample_bse_equities.csv ---")
cursor.execute("SELECT id, symbol, company_name, exchange, isin, data_source FROM stocks WHERE data_source LIKE '%sample_bse%' LIMIT 10")
for r in cursor.fetchall():
    print(dict(r))

print("\n--- C. Checking if the sample_bse symbols match Security Id vs Security Code in Equity_BSE.csv ---")
# In sample_bse_equities.csv, what did we use as symbol?
# E.g. RELIANCE, TCS, HDFCBANK!
# In Equity_BSE.csv, what was imported as symbol?
cursor.execute("SELECT symbol, company_name, isin FROM stocks WHERE exchange = 'BSE' AND isin = 'INE002A01018'")
print("BSE listings with Reliance ISIN:", [dict(r) for r in cursor.fetchall()])

cursor.execute("SELECT symbol, company_name, isin FROM stocks WHERE exchange = 'BSE' AND isin = 'INE467B01029'")
print("BSE listings with TCS ISIN:", [dict(r) for r in cursor.fetchall()])

print("\n--- D. Duplicate exchange-symbol pairs ---")
cursor.execute("SELECT symbol, exchange, COUNT(*) as cnt FROM stocks GROUP BY symbol, exchange HAVING cnt > 1")
print([dict(r) for r in cursor.fetchall()])

print("\n--- E. Cross-exchange ISIN sharing ---")
cursor.execute("""
SELECT isin, COUNT(DISTINCT exchange) as exch_cnt, COUNT(*) as total_cnt
FROM stocks
WHERE isin IS NOT NULL
GROUP BY isin
HAVING exch_cnt > 1
""")
shared_isins = cursor.fetchall()
print(f"Total ISINs listed on both NSE and BSE: {len(shared_isins)}")

print("\n--- F. Instrument types in Equity_BSE.csv ---")
# Let's inspect the CSV directly
with open("data/Equity_BSE.csv", mode="r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    instruments = {}
    statuses = {}
    groups = {}
    for row in reader:
        inst = row.get("Instrument", "").strip()
        instruments[inst] = instruments.get(inst, 0) + 1
        st = row.get("Status", "").strip()
        statuses[st] = statuses.get(st, 0) + 1
        gp = row.get("Group", "").strip()
        groups[gp] = groups.get(gp, 0) + 1

print("BSE CSV Instruments:", instruments)
print("BSE CSV Statuses:", statuses)
print("BSE CSV Groups:", groups)

conn.close()
