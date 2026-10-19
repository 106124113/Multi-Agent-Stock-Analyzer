import sqlite3
import json

conn = sqlite3.connect("stocks.db")
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

print("--- 1. TOTAL RECORDS & ACTIVE/INACTIVE ---")
cursor.execute("SELECT is_active, is_prototype_data, COUNT(*) as cnt FROM stocks GROUP BY is_active, is_prototype_data")
print([dict(r) for r in cursor.fetchall()])

cursor.execute("SELECT exchange, is_active, COUNT(*) as cnt FROM stocks GROUP BY exchange, is_active")
print([dict(r) for r in cursor.fetchall()])

print("\n--- 2. DATA SOURCE BREAKDOWN ---")
cursor.execute("SELECT data_source, COUNT(*) as cnt FROM stocks GROUP BY data_source")
print([dict(r) for r in cursor.fetchall()])

print("\n--- 3. IMPORT LOGS ---")
cursor.execute("SELECT * FROM import_logs")
for r in cursor.fetchall():
    print(dict(r))

print("\n--- 4. SEED RECORDS STILL PRESENT (is_prototype_data = 1) ---")
cursor.execute("SELECT id, symbol, company_name, exchange, isin, series, data_source FROM stocks WHERE is_prototype_data = 1")
seeds = [dict(r) for r in cursor.fetchall()]
print(f"Total seeds: {len(seeds)}")
for s in seeds:
    print(s)

print("\n--- 5. CHECK PREVIOUS IMPORTS (e.g. sample_nse_equities.csv / sample_bse_equities.csv) ---")
cursor.execute("SELECT data_source, exchange, COUNT(*) FROM stocks WHERE data_source LIKE '%sample%' GROUP BY data_source, exchange")
print([dict(r) for r in cursor.fetchall()])

print("\n--- 6. BSE SECURITY SERIES / GROUP & INSTRUMENT TYPE ---")
cursor.execute("SELECT exchange, series, COUNT(*) as cnt FROM stocks GROUP BY exchange, series ORDER BY exchange, cnt DESC")
for r in cursor.fetchall():
    print(dict(r))

print("\n--- 7. EXAMINING 47 NSE UPDATED RECORDS ---")
# To see which NSE records were updated, let's check which ones were in sample_nse_equities or seed
# Or records where imported_at matches the NSE import run
cursor.execute("SELECT id, symbol, company_name, exchange, isin, data_source, imported_at FROM stocks WHERE exchange = 'NSE' AND data_source = 'Official NSE Securities File (EQUITY_L.csv)' LIMIT 5")
print("Sample NSE imported:", [dict(r) for r in cursor.fetchall()])

conn.close()
