"""CLI script to import official NSE and BSE securities files into the stock catalog.

Usage:
  python import_catalog.py --file <path_to_file> --exchange <NSE|BSE> [--series <EQ|A>]
"""

import argparse
import sys
from catalog_importer import import_catalog_file
from database import get_total_listings_count, init_db, is_official_catalog_imported


def main():
    parser = argparse.ArgumentParser(description="Import official NSE and BSE securities files into SQLite stock catalog.")
    parser.add_argument("--file", "-f", required=True, help="Path to securities CSV or Excel file")
    parser.add_argument("--exchange", "-e", required=True, choices=["NSE", "BSE", "nse", "bse"], help="Exchange (NSE or BSE)")
    parser.add_argument("--series", "-s", default="EQ", help="Default series if missing from file (e.g., EQ or A)")

    args = parser.parse_args()

    init_db()

    print(f"[*] Starting catalog import for exchange: {args.exchange.upper()}")
    print(f"[*] Reading source file: {args.file}")

    try:
        summary = import_catalog_file(
            file_path=args.file,
            exchange=args.exchange,
            default_series=args.series
        )

        print("\n" + "="*50)
        print("          CATALOG IMPORT SUMMARY")
        print("="*50)
        print(f" Source File        : {summary.source_file}")
        print(f" Exchange           : {summary.exchange}")
        print(f" Status             : {summary.status.upper()}")
        print(f" Total Processed    : {summary.total_processed}")
        print(f" Records Added      : {summary.records_added}")
        print(f" Records Updated    : {summary.records_updated}")
        print(f" Records Skipped    : {summary.records_skipped}")
        print(f" Duplicates Detected: {summary.duplicates_detected}")
        print(f" Invalid Rows       : {summary.invalid_rows}")
        print(f" Timestamp          : {summary.timestamp}")
        print(f" Notes              : {summary.notes}")
        print("="*50)

        total_in_db = get_total_listings_count()
        is_imported = is_official_catalog_imported()
        print(f"[*] Total active listings currently in DB: {total_in_db}")
        print(f"[*] Official Catalog Active: {is_imported}")

    except Exception as e:
        print(f"\n[!] Import failed: {str(e)}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
